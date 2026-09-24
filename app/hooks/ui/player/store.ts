"use client";

import { closeMiniWindow, nextRepeat, openMiniWindow, restorablePlayerMode, shouldRestart } from "@components/Player";
import type {
  CompressorPresetId,
  EqualizerPresetRef,
  PlayerMode,
  PlayerNoticeTone,
  PlayerTrack,
  PlayerTransition,
} from "@components/Player";
import { artworkProxySrc } from "@utils/artworkProxy";

import {
  COMPRESSOR_PRESETS,
  COMPRESSOR_STORAGE_KEY,
  CONVERSION_STORAGE_KEY,
  EQUALIZER_PRESETS,
  EQUALIZER_PRESETS_STORAGE_KEY,
  EQUALIZER_STORAGE_KEY,
  MAX_CONSECUTIVE_FAILURES,
  MAX_QUEUE_TRACKS,
  MIRROR_STALE_MS,
  MIRROR_TICK_MS,
  MODE_STORAGE_KEY,
  SKIP_DELAY_MS,
  TRANSITION_STORAGE_KEY,
  VOLUME_STORAGE_KEY,
} from "./constants";
import { announce } from "./announce";
import { setCompressor, setEqualizerGains, setEqualizerPreamp } from "./audio-graph";
import { defaultCompressor, restorableCompressor, steppedCompressorValue } from "./compressor";
import { defaultConversion, restorableConversion, streamConversionFor } from "./conversion";
import {
  applyVolume,
  cancelPrime,
  canPlayMime,
  connectEngine,
  crossfadeTo,
  loadAndPlay,
  loadAt,
  pause,
  prime,
  primedUrl,
  resume,
  seek,
  setActiveTrackGain,
  stop,
} from "./engine";
import {
  appliedEqualizerGains,
  flatEqualizer,
  presetNameFrom,
  restorableEqualizer,
  restorableEqualizerPresets,
  steppedGainDb,
  withCustomPreset,
} from "./equalizer";
import { gainFactorFor, loudnessModeFor } from "./loudness";
import {
  mirroredPositionSeconds,
  needsConversion,
  nextIndexIn,
  previousIndexIn,
  resolveQueueAdditions,
  shuffledOrder,
  streamUrlFor,
  visibleQueueIds,
  withoutQueueIndex,
  withoutQueuePositions,
  withoutRepeats,
} from "./helpers";
import { clearMediaSession, publishMediaSession, publishPlaybackState, publishPosition } from "./media-session";
import {
  defaultTransition,
  fadeAllowed,
  primeDue,
  restorableTransition,
  sameTransition,
  steppedTransitionSeconds,
  transitionFadeSeconds,
} from "./transition";
import type {
  CompressorParam,
  CompressorSettings,
  ConversionSettings,
  EqualizerCustomPreset,
  EqualizerSettings,
  LoudnessMode,
  LoudnessPreferences,
  PlayerSessionState,
  QueueAddOutcome,
  RemotePlayback,
  StreamConversion,
} from "./types";

const listeners = new Set<() => void>();

let state: PlayerSessionState = {
  queue: [],
  index: 0,
  playing: false,
  loading: false,
  positionSeconds: 0,
  durationSeconds: 0,
  scrubSeconds: null,
  volume: 0.8,
  muted: false,
  shuffle: false,
  shuffleOrder: [],
  repeat: "off",
  transcoding: false,
  armed: false,
  remote: null,
  offsetSeconds: 0,
  chainVisible: false,
  devicesOpen: false,
  settingsOpen: false,
  equalizer: flatEqualizer(),
  equalizerPresets: [],
  compressor: defaultCompressor(),
  conversion: defaultConversion(),
  transition: defaultTransition(),
  modesOpen: false,
  queueOpen: false,
  mode: "normal",
  lyricsOpen: false,
  fullscreen: false,
  consecutiveFailures: 0,
  started: false,
};

let mirrorTimer: ReturnType<typeof setInterval> | undefined;
let skipTimer: ReturnType<typeof setTimeout> | undefined;
let connected = false;
let loudness: LoudnessPreferences = { enabled: true, preAmpDb: 0 };
let activeLoudnessMode: LoudnessMode = "track";

function publish(next: Partial<PlayerSessionState>): void {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): PlayerSessionState {
  return state;
}

export function currentTrack(): PlayerTrack | null {
  return state.queue[state.index] ?? null;
}

function tickMirror(): void {
  if (state.remote !== null && state.remote.playing && Date.now() - state.remote.updatedAt > MIRROR_STALE_MS) {
    actions.forgetRemote();
    return;
  }
  publish({});
}

function silenceOtherAudio(): void {
  if (typeof document === "undefined") return;
  for (const element of document.querySelectorAll<HTMLMediaElement>("audio, video")) {
    if (!element.paused) element.pause();
  }
}

function notify(text: string, tone: PlayerNoticeTone): void {
  announce({ text, tone });
}

function ensureConnected(): void {
  if (connected) return;
  connected = true;
  connectEngine({
    onProgress: (positionSeconds, durationSeconds) => {
      const elapsed = state.offsetSeconds + positionSeconds;
      const total = state.offsetSeconds > 0 ? state.durationSeconds : durationSeconds || state.durationSeconds;
      publish({ positionSeconds: elapsed, durationSeconds: total });
      publishPosition(total, elapsed, state.playing);
      maintainPrime(elapsed, total);
    },
    onEnded: () => advance(true),
    onHandoff: (url) => adoptHandoff(url),
    onPlayingChange: (playing) => {
      publish({
        playing,
        armed: state.armed || playing,
        consecutiveFailures: playing ? 0 : state.consecutiveFailures,
      });
      publishPlaybackState(playing);
    },
    onLoadingChange: (loading) => publish({ loading }),
    onFailure: (reason) => handleFailure(reason),
  });
}

function conversionFor(track: PlayerTrack): StreamConversion | null {
  return streamConversionFor(needsConversion(track.format, canPlayMime), state.conversion);
}

function skipFadeSeconds(target: PlayerTrack): number {
  if (!state.playing) return 0;
  return fadeAllowed(transitionFadeSeconds(state.transition, "skip"), state.durationSeconds, target.durationSeconds);
}

function playAt(index: number, fromSeconds = 0, fadeSeconds = 0): void {
  const track = state.queue[index];
  if (track === undefined) return;
  ensureConnected();
  silenceOtherAudio();
  clearInterval(mirrorTimer);
  clearTimeout(skipTimer);
  const conversion = conversionFor(track);
  const converted = conversion !== null;
  publish({
    remote: null,
    index,
    positionSeconds: fromSeconds,
    durationSeconds: track.durationSeconds,
    scrubSeconds: null,
    started: true,
    loading: true,
    transcoding: converted,
    offsetSeconds: converted ? fromSeconds : 0,
  });
  const url = streamUrlFor(track.id, conversion, fromSeconds);
  const start = converted ? 0 : fromSeconds;
  if (fadeSeconds > 0) {
    const gainFactor = startLoudness(track, state.queue, state.shuffle, false);
    crossfadeTo(
      url,
      { seconds: fadeSeconds, curve: state.transition.curve, gainFactor },
      state.volume,
      state.muted,
      start
    );
  } else {
    startLoudness(track, state.queue, state.shuffle, true);
    loadAndPlay(url, state.volume, state.muted, start);
  }
  publishMediaSession(track, mediaHandlers());
}

function automaticNextIndex(): number | null {
  if (state.repeat === "one") return null;
  const next = nextIndexIn(state);
  if (next !== null) return next;
  if (state.repeat === "all" && state.queue.length > 0) return state.shuffle ? (state.shuffleOrder[0] ?? 0) : 0;
  return null;
}

function maintainPrime(positionSeconds: number, durationSeconds: number): void {
  if (!state.playing) return;
  const next = automaticNextIndex();
  const track = next === null ? undefined : state.queue[next];
  if (track === undefined) {
    cancelPrime();
    return;
  }
  const url = streamUrlFor(track.id, conversionFor(track), 0);
  const fade = fadeAllowed(transitionFadeSeconds(state.transition, "ended"), durationSeconds, track.durationSeconds);
  if (!primeDue(positionSeconds, durationSeconds, fade)) {
    if (primedUrl() !== url) cancelPrime();
    return;
  }
  prime({
    url,
    gainFactor: gainFactorFor(track, activeLoudnessMode, loudness),
    fadeSeconds: fade,
    curve: state.transition.curve,
  });
}

function adoptHandoff(url: string): void {
  const expected = automaticNextIndex();
  const matches = (index: number): boolean => {
    const track = state.queue[index];
    return track !== undefined && streamUrlFor(track.id, conversionFor(track), 0) === url;
  };
  const index = expected !== null && matches(expected) ? expected : state.queue.findIndex((_, at) => matches(at));
  const track = state.queue[index];
  if (track === undefined) {
    advance(true);
    return;
  }
  clearTimeout(skipTimer);
  publish({
    remote: null,
    index,
    positionSeconds: 0,
    durationSeconds: track.durationSeconds,
    scrubSeconds: null,
    started: true,
    loading: false,
    transcoding: conversionFor(track) !== null,
    offsetSeconds: 0,
    consecutiveFailures: 0,
  });
  activeLoudnessMode = loudnessModeFor(state.queue, state.shuffle);
  publishMediaSession(track, mediaHandlers());
}

function armAt(queue: readonly PlayerTrack[], index: number, fromSeconds: number, order: number[]): void {
  const track = queue[index];
  if (track === undefined) return;
  ensureConnected();
  const conversion = streamConversionFor(needsConversion(track.format, canPlayMime), state.conversion);
  const converted = conversion !== null;
  publish({
    queue,
    index,
    shuffleOrder: order,
    positionSeconds: fromSeconds,
    durationSeconds: track.durationSeconds,
    scrubSeconds: null,
    started: true,
    playing: false,
    loading: false,
    transcoding: converted,
    offsetSeconds: converted ? fromSeconds : 0,
    consecutiveFailures: 0,
  });
  startLoudness(track, queue, state.shuffle, true);
  loadAt(streamUrlFor(track.id, conversion, fromSeconds), converted ? 0 : fromSeconds, state.volume, state.muted);
  publishMediaSession(track, mediaHandlers());
}

function seekWithin(seconds: number): void {
  if (state.transcoding) {
    playAt(state.index, seconds);
    return;
  }
  seek(seconds);
  publish({ positionSeconds: seconds, scrubSeconds: null });
}

function advance(automatic: boolean): void {
  const messages = lastMessages;
  if (automatic && state.repeat === "one") {
    if (state.transcoding) {
      playAt(state.index, 0);
      return;
    }
    seek(0);
    resume();
    return;
  }
  const next = nextIndexIn(state);
  if (next === null) {
    if (state.repeat === "all" && state.queue.length > 0) {
      const first = state.shuffle ? (state.shuffleOrder[0] ?? 0) : 0;
      playAt(first, 0, automatic ? 0 : fadeTowards(first));
      return;
    }
    pause();
    publish({ playing: false, positionSeconds: state.durationSeconds });
    publishPlaybackState(false);
    notify(messages.queueEnd, "info");
    return;
  }
  playAt(next, 0, automatic ? 0 : fadeTowards(next));
}

function fadeTowards(index: number): number {
  const target = state.queue[index];
  return target === undefined ? 0 : skipFadeSeconds(target);
}

function handleFailure(reason: "load" | "stall" | "autoplay"): void {
  const messages = lastMessages;
  const track = currentTrack();
  if (track === null) return;
  if (reason === "autoplay") {
    publish({ playing: false, loading: false });
    notify(messages.autoplayBlocked, "warning");
    return;
  }

  const failures = state.consecutiveFailures + 1;
  publish({ consecutiveFailures: failures, loading: false, playing: false });
  if (failures >= MAX_CONSECUTIVE_FAILURES) {
    stop();
    publish({ started: false });
    notify(messages.tooManyFailures, "danger");
    return;
  }
  notify(messages.skipping(track.title), "danger");
  clearTimeout(skipTimer);
  skipTimer = setTimeout(() => advance(true), SKIP_DELAY_MS);
}

export interface PlayerMessages {
  skipping: (title: string) => string;
  resumedFrom: (client: string) => string;
  handOverFailed: (device: string) => string;
  deviceGone: string;
  queueEnd: string;
  autoplayBlocked: string;
  tooManyFailures: string;
}

let lastMessages: PlayerMessages = {
  skipping: (title) => title,
  resumedFrom: (client) => client,
  handOverFailed: (device) => device,
  deviceGone: "",
  queueEnd: "",
  autoplayBlocked: "",
  tooManyFailures: "",
};

export function setMessages(messages: PlayerMessages): void {
  lastMessages = messages;
}

export function setLoudnessPreferences(next: LoudnessPreferences): void {
  loudness = next;
  const track = currentTrack();
  setActiveTrackGain(track === null ? 1 : gainFactorFor(track, activeLoudnessMode, loudness));
}

function startLoudness(track: PlayerTrack, queue: readonly PlayerTrack[], shuffle: boolean, apply: boolean): number {
  activeLoudnessMode = loudnessModeFor(queue, shuffle);
  const factor = gainFactorFor(track, activeLoudnessMode, loudness);
  if (apply) setActiveTrackGain(factor);
  return factor;
}

function persist(key: string, value: unknown): void {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

function applyEqualizer(next: EqualizerSettings): void {
  setEqualizerGains(appliedEqualizerGains(next));
  setEqualizerPreamp(next.enabled ? next.preampDb : 0);
}

function writeEqualizer(next: EqualizerSettings): void {
  publish({ equalizer: next });
  applyEqualizer(next);
  persist(EQUALIZER_STORAGE_KEY, next);
}

function writeEqualizerPresets(next: readonly EqualizerCustomPreset[]): void {
  publish({ equalizerPresets: next });
  persist(EQUALIZER_PRESETS_STORAGE_KEY, next);
}

function writeCompressor(next: CompressorSettings): void {
  publish({ compressor: next });
  setCompressor(next);
  persist(COMPRESSOR_STORAGE_KEY, next);
}

function reloadCurrentTrack(): void {
  if (!state.started) return;
  if (state.playing) {
    playAt(state.index, state.positionSeconds);
    return;
  }
  armAt(state.queue, state.index, state.positionSeconds, [...state.shuffleOrder]);
}

function mediaHandlers(): {
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
} {
  return {
    play: () => actions.togglePlay(),
    pause: () => actions.togglePlay(),
    next: () => advance(false),
    previous: () => actions.previous(),
    seekTo: (seconds) => actions.seekTo(seconds),
  };
}

export function sessionSnapshot(): { trackIds: string[]; currentTrackId: string | null; positionMs: number } {
  return {
    trackIds: state.queue.map((track) => track.id),
    currentTrackId: currentTrack()?.id ?? null,
    positionMs: Math.max(0, Math.round(state.positionSeconds * 1000)),
  };
}

export const actions = {
  restoreSession(
    tracks: readonly PlayerTrack[],
    currentTrackId: string | null,
    positionSeconds: number,
    resumedFrom: string | null
  ): void {
    if (state.started || tracks.length === 0) return;
    const found = tracks.findIndex((track) => track.id === currentTrackId);
    const index = Math.max(0, found);
    const track = tracks[index];
    if (track === undefined) return;
    const resumeAt = found < 0 ? 0 : Math.min(positionSeconds, track.durationSeconds);
    armAt(tracks, index, resumeAt, state.shuffle ? shuffledOrder(tracks.length, index) : []);
    if (resumedFrom !== null) notify(lastMessages.resumedFrom(resumedFrom), "info");
  },
  takeOver(tracks: readonly PlayerTrack[], currentTrackId: string | null, positionSeconds: number): void {
    if (tracks.length === 0) return;
    const found = tracks.findIndex((track) => track.id === currentTrackId);
    const index = Math.max(0, found);
    publish({
      queue: tracks,
      shuffleOrder: state.shuffle ? shuffledOrder(tracks.length, index) : [],
      consecutiveFailures: 0,
      started: false,
    });
    playAt(index, found < 0 ? 0 : positionSeconds);
  },
  playQueue(tracks: readonly PlayerTrack[], startIndex: number): void {
    if (tracks.length === 0) return;
    const start = tracks[startIndex];
    const queue = withoutRepeats(tracks, [], tracks.length);
    const at = start === undefined ? 0 : Math.max(0, queue.indexOf(start));
    const order = state.shuffle ? shuffledOrder(queue.length, at) : [];
    publish({ queue, shuffleOrder: order, consecutiveFailures: 0 });
    playAt(at);
  },
  addToQueue(tracks: readonly PlayerTrack[]): QueueAddOutcome {
    const additions = resolveQueueAdditions(state, tracks);
    if (additions.fresh.length === 0) return additions.outcome;

    const pruned = withoutQueuePositions(state, additions.relocated);
    const queue = [...pruned.queue, ...additions.fresh];
    if (state.queue.length === 0) {
      armAt(queue, 0, 0, state.shuffle ? shuffledOrder(queue.length, 0) : []);
      return additions.outcome;
    }

    const appended = additions.fresh.map((_, at) => pruned.queue.length + at);
    publish({
      queue,
      index: pruned.index,
      shuffleOrder: state.shuffle ? [...pruned.shuffleOrder, ...appended] : [],
    });
    return additions.outcome;
  },
  playNext(tracks: readonly PlayerTrack[]): QueueAddOutcome {
    const additions = resolveQueueAdditions(state, tracks);
    if (additions.fresh.length === 0) return additions.outcome;

    const pruned = withoutQueuePositions(state, additions.relocated);
    if (state.queue.length === 0) {
      armAt(additions.fresh, 0, 0, state.shuffle ? shuffledOrder(additions.fresh.length, 0) : []);
      return additions.outcome;
    }

    if (state.shuffle) {
      const queue = [...pruned.queue, ...additions.fresh];
      const appended = additions.fresh.map((_, at) => pruned.queue.length + at);
      const at = pruned.shuffleOrder.indexOf(pruned.index);
      const order =
        at < 0
          ? [...pruned.shuffleOrder, ...appended]
          : [...pruned.shuffleOrder.slice(0, at + 1), ...appended, ...pruned.shuffleOrder.slice(at + 1)];
      publish({ queue, index: pruned.index, shuffleOrder: order });
      return additions.outcome;
    }

    const insertAt = pruned.index + 1;
    const queue = [...pruned.queue.slice(0, insertAt), ...additions.fresh, ...pruned.queue.slice(insertAt)];
    publish({ queue, index: pruned.index, shuffleOrder: [] });
    return additions.outcome;
  },
  togglePlay(): void {
    const track = currentTrack();
    if (track === null) return;
    if (!state.started) {
      playAt(state.index);
      return;
    }
    if (state.playing) {
      pause();
      return;
    }
    resume();
  },
  next(): void {
    advance(false);
  },
  jumpTo(index: number): void {
    playAt(index, 0, fadeTowards(index));
  },
  removeFromQueue(index: number): void {
    if (index === state.index || state.queue[index] === undefined) return;
    publish({
      queue: state.queue.filter((_, at) => at !== index),
      index: index < state.index ? state.index - 1 : state.index,
      shuffleOrder: state.shuffle ? withoutQueueIndex(state.shuffleOrder, index) : [],
    });
  },
  reorderQueue(tail: readonly PlayerTrack[]): void {
    if (tail.length === 0) return;
    if (state.shuffle) {
      const at = state.shuffleOrder.indexOf(state.index);
      const positions = tail.map((track) => state.queue.indexOf(track));
      if (at < 0 || positions.some((index) => index < 0)) return;
      publish({ shuffleOrder: [...state.shuffleOrder.slice(0, at + 1), ...positions] });
      return;
    }
    publish({ queue: [...state.queue.slice(0, state.index + 1), ...tail] });
  },
  previous(): void {
    if (shouldRestart(state.positionSeconds)) {
      seekWithin(0);
      return;
    }
    const previous = previousIndexIn(state);
    if (previous === null) {
      seekWithin(0);
      return;
    }
    playAt(previous, 0, fadeTowards(previous));
  },
  seekTo(seconds: number): void {
    seekWithin(seconds);
  },
  scrubTo(seconds: number | null): void {
    publish({ scrubSeconds: seconds });
  },
  setVolume(volume: number): void {
    const clamped = Math.min(1, Math.max(0, volume));
    applyVolume(clamped, false);
    publish({ volume: clamped, muted: false });
    if (typeof window !== "undefined") window.localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
  },
  toggleMute(): void {
    const muted = !state.muted;
    applyVolume(state.volume, muted);
    publish({ muted });
  },
  toggleShuffle(): void {
    const shuffle = !state.shuffle;
    publish({ shuffle, shuffleOrder: shuffle ? shuffledOrder(state.queue.length, state.index) : [] });
  },
  cycleRepeat(): void {
    publish({ repeat: nextRepeat(state.repeat) });
  },
  toggleChain(): void {
    publish({ chainVisible: !state.chainVisible });
  },
  toggleDevices(): void {
    publish({ devicesOpen: !state.devicesOpen, modesOpen: false });
  },
  toggleSettings(): void {
    publish({ settingsOpen: !state.settingsOpen, devicesOpen: false, modesOpen: false });
  },
  setEqualizerEnabled(enabled: boolean): void {
    writeEqualizer({ ...state.equalizer, enabled });
  },
  setEqualizerBand(band: number, gainDb: number): void {
    if (state.equalizer.gainsDb[band] === undefined) return;
    const gainsDb = state.equalizer.gainsDb.map((current, at) => (at === band ? steppedGainDb(gainDb) : current));
    writeEqualizer({ ...state.equalizer, gainsDb });
  },
  setEqualizerPreamp(preampDb: number): void {
    writeEqualizer({ ...state.equalizer, preampDb: steppedGainDb(preampDb) });
  },
  applyEqualizerPreset(preset: EqualizerPresetRef): void {
    if (preset.kind === "builtIn") {
      writeEqualizer({ ...state.equalizer, gainsDb: EQUALIZER_PRESETS[preset.id] });
      return;
    }
    const custom = state.equalizerPresets.find((entry) => entry.name === preset.name);
    if (custom === undefined) return;
    writeEqualizer({ ...state.equalizer, gainsDb: custom.gainsDb });
  },
  saveEqualizerPreset(rawName: string): void {
    const name = presetNameFrom(rawName);
    if (name === null) return;
    writeEqualizerPresets(withCustomPreset(state.equalizerPresets, { name, gainsDb: state.equalizer.gainsDb }));
  },
  deleteEqualizerPreset(name: string): void {
    if (!state.equalizerPresets.some((entry) => entry.name === name)) return;
    writeEqualizerPresets(state.equalizerPresets.filter((entry) => entry.name !== name));
  },
  setCompressorEnabled(enabled: boolean): void {
    writeCompressor({ ...state.compressor, enabled });
  },
  applyCompressorPreset(preset: CompressorPresetId): void {
    writeCompressor({ ...state.compressor, ...COMPRESSOR_PRESETS[preset] });
  },
  setCompressorParam(param: CompressorParam, value: number): void {
    writeCompressor({ ...state.compressor, [param]: steppedCompressorValue(param, value) });
  },
  setConversion(next: ConversionSettings): void {
    if (next.enabled === state.conversion.enabled && next.bitrateKbps === state.conversion.bitrateKbps) return;
    publish({ conversion: next });
    persist(CONVERSION_STORAGE_KEY, next);
    reloadCurrentTrack();
  },
  setTransition(next: PlayerTransition): void {
    const settled: PlayerTransition = { ...next, seconds: steppedTransitionSeconds(next.seconds) };
    if (sameTransition(state.transition, settled)) return;
    publish({ transition: settled });
    persist(TRANSITION_STORAGE_KEY, settled);
  },
  toggleModes(): void {
    publish({ modesOpen: !state.modesOpen, devicesOpen: false });
  },
  toggleQueue(): void {
    publish({ queueOpen: !state.queueOpen, devicesOpen: false, modesOpen: false });
  },
  selectMode(mode: PlayerMode): void {
    if (state.mode === "mini" && mode !== "mini") closeMiniWindow();
    if (mode === "mini") {
      void openMiniWindow(() => {
        if (state.mode === "mini") actions.selectMode("normal");
      }).then((opened) => {
        if (!opened && state.mode === "mini") actions.selectMode("normal");
      });
    }
    if (typeof window !== "undefined") window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    publish({ mode, modesOpen: false });
  },
  toggleFullscreen(): void {
    publish({ fullscreen: !state.fullscreen, modesOpen: false, lyricsOpen: false });
  },
  openLyrics(): void {
    publish({ fullscreen: true, lyricsOpen: true, devicesOpen: false, modesOpen: false });
  },
  toggleLyrics(): void {
    publish({ lyricsOpen: !state.lyricsOpen, devicesOpen: false });
  },
  applyRemoteState(remote: RemotePlayback): void {
    if (remote.playing) {
      pause();
      cancelPrime();
      clearMediaSession();
      clearInterval(mirrorTimer);
      mirrorTimer = setInterval(tickMirror, MIRROR_TICK_MS);
      publish({ remote, playing: false, started: true });
      return;
    }
    if (state.remote === null || state.remote.deviceId !== remote.deviceId) return;
    clearInterval(mirrorTimer);
    publish({ remote });
  },
  playHere(): boolean {
    const remote = state.remote;
    if (remote === null || remote.track === null) return false;
    const index = state.queue.findIndex((track) => track.id === remote.track?.id);
    if (index < 0) return false;
    publish({
      shuffle: remote.shuffle,
      shuffleOrder: remote.shuffle ? shuffledOrder(state.queue.length, index) : [],
      repeat: remote.repeat,
      volume: remote.volume,
      muted: remote.muted,
    });
    applyVolume(remote.volume, remote.muted);
    playAt(index, remote.playing ? mirroredPositionSeconds(remote, Date.now()) : remote.positionSeconds);
    return true;
  },
  expectRemote(patch: Partial<RemotePlayback>): void {
    const remote = state.remote;
    if (remote === null) return;
    const carried = patch.playing === undefined ? remote.positionSeconds : mirroredPositionSeconds(remote, Date.now());
    publish({ remote: { ...remote, positionSeconds: carried, updatedAt: Date.now(), ...patch } });
    if (patch.playing === true) {
      clearInterval(mirrorTimer);
      mirrorTimer = setInterval(tickMirror, MIRROR_TICK_MS);
    }
  },
  resync(): void {
    if (state.remote === null) return;
    clearInterval(mirrorTimer);
    if (state.remote.playing) mirrorTimer = setInterval(tickMirror, MIRROR_TICK_MS);
    publish({});
  },
  recoverUnconfirmedHandOver(deviceId: string): void {
    const remote = state.remote;
    if (remote === null || remote.deviceId !== deviceId || remote.confirmed) return;
    const index = state.queue.findIndex((track) => track.id === remote.track?.id);
    clearInterval(mirrorTimer);
    publish({ remote: null });
    notify(lastMessages.handOverFailed(remote.deviceName), "warning");
    if (index < 0) return;
    playAt(index, remote.positionSeconds);
  },
  forgetRemote(): void {
    if (state.remote === null) return;
    clearInterval(mirrorTimer);
    publish({ remote: null });
  },
  adoptQueue(tracks: readonly PlayerTrack[], currentTrackId: string | null): void {
    if (state.playing || tracks.length === 0) return;
    const index = Math.max(
      0,
      tracks.findIndex((track) => track.id === currentTrackId)
    );
    publish({ queue: tracks, index, shuffleOrder: [], started: true });
  },
  resumeHere(): void {
    if (state.playing) return;
    if (state.remote !== null) {
      clearInterval(mirrorTimer);
      publish({ remote: null });
    }
    actions.togglePlay();
  },
  announceDeviceGone(): void {
    notify(lastMessages.deviceGone, "warning");
  },
  pauseHere(): void {
    if (!state.playing) return;
    pause();
  },
  restoreVolume(): void {
    if (typeof window === "undefined") return;
    const stored = Number(window.localStorage.getItem(VOLUME_STORAGE_KEY));
    if (!Number.isFinite(stored) || stored <= 0 || stored > 1) return;
    applyVolume(stored, state.muted);
    publish({ volume: stored });
  },
  restoreMode(): void {
    if (typeof window === "undefined") return;
    const stored = restorablePlayerMode(window.localStorage.getItem(MODE_STORAGE_KEY));
    if (stored === null) return;
    publish({ mode: stored });
  },
  restorePlaybackSettings(): void {
    if (typeof window === "undefined") return;
    const equalizer = restorableEqualizer(window.localStorage.getItem(EQUALIZER_STORAGE_KEY));
    if (equalizer !== null) {
      publish({ equalizer });
      applyEqualizer(equalizer);
    }
    const presets = restorableEqualizerPresets(window.localStorage.getItem(EQUALIZER_PRESETS_STORAGE_KEY));
    if (presets !== null) publish({ equalizerPresets: presets });
    const compressor = restorableCompressor(window.localStorage.getItem(COMPRESSOR_STORAGE_KEY));
    if (compressor !== null) {
      publish({ compressor });
      setCompressor(compressor);
    }
    const conversion = restorableConversion(window.localStorage.getItem(CONVERSION_STORAGE_KEY));
    if (conversion !== null) publish({ conversion });
    const transition = restorableTransition(window.localStorage.getItem(TRANSITION_STORAGE_KEY));
    if (transition !== null) publish({ transition });
  },
  artworkFor(track: PlayerTrack): string | null {
    return track.artworkUrl === null ? null : artworkProxySrc(track.artworkUrl);
  },
};
