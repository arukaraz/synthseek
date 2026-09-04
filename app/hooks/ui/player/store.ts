"use client";

import { nextRepeat, shouldRestart } from "@components/Player";
import type { PlayerTrack } from "@components/Player";
import { artworkProxySrc } from "@utils/artworkProxy";

import { MAX_CONSECUTIVE_FAILURES, NOTICE_MS, SKIP_DELAY_MS, VOLUME_STORAGE_KEY } from "./constants";
import { applyVolume, canPlayMime, connectEngine, loadAndPlay, loadAt, pause, resume, seek, stop } from "./engine";
import { needsConversion, nextIndexIn, previousIndexIn, shuffledOrder, streamUrlFor } from "./helpers";
import { publishMediaSession, publishPlaybackState, publishPosition } from "./media-session";
import type { PlayerSessionState } from "./types";

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
  offsetSeconds: 0,
  chainVisible: false,
  moreOpen: false,
  devicesOpen: false,
  fullscreen: false,
  notice: null,
  consecutiveFailures: 0,
  started: false,
};

let noticeTimer: ReturnType<typeof setTimeout> | undefined;
let skipTimer: ReturnType<typeof setTimeout> | undefined;
let connected = false;

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

function notify(text: string, tone: "info" | "warning" | "danger"): void {
  publish({ notice: { text, tone } });
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => publish({ notice: null }), NOTICE_MS);
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
    },
    onEnded: () => advance(true),
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

function playAt(index: number, fromSeconds = 0): void {
  const track = state.queue[index];
  if (track === undefined) return;
  ensureConnected();
  clearTimeout(skipTimer);
  const converted = needsConversion(track.format, canPlayMime);
  publish({
    index,
    positionSeconds: fromSeconds,
    durationSeconds: track.durationSeconds,
    scrubSeconds: null,
    started: true,
    loading: true,
    transcoding: converted,
    offsetSeconds: converted ? fromSeconds : 0,
  });
  loadAndPlay(streamUrlFor(track.id, converted, fromSeconds), state.volume, state.muted, converted ? 0 : fromSeconds);
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
      playAt(state.shuffle ? (state.shuffleOrder[0] ?? 0) : 0);
      return;
    }
    stop();
    publish({ playing: false, positionSeconds: state.durationSeconds });
    notify(messages.queueEnd, "info");
    return;
  }
  playAt(next);
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
  deviceGone: string;
  queueEnd: string;
  autoplayBlocked: string;
  tooManyFailures: string;
}

let lastMessages: PlayerMessages = {
  skipping: (title) => title,
  resumedFrom: (client) => client,
  deviceGone: "",
  queueEnd: "",
  autoplayBlocked: "",
  tooManyFailures: "",
};

export function setMessages(messages: PlayerMessages): void {
  lastMessages = messages;
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
    ensureConnected();
    const converted = needsConversion(track.format, canPlayMime);
    const resumeAt = found < 0 ? 0 : Math.min(positionSeconds, track.durationSeconds);
    publish({
      queue: tracks,
      index,
      positionSeconds: resumeAt,
      durationSeconds: track.durationSeconds,
      scrubSeconds: null,
      started: true,
      playing: false,
      loading: false,
      transcoding: converted,
      offsetSeconds: converted ? resumeAt : 0,
      consecutiveFailures: 0,
    });
    loadAt(streamUrlFor(track.id, converted, resumeAt), converted ? 0 : resumeAt, state.volume, state.muted);
    publishMediaSession(track, mediaHandlers());
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
    const order = state.shuffle ? shuffledOrder(tracks.length, startIndex) : [];
    publish({ queue: tracks, shuffleOrder: order, consecutiveFailures: 0 });
    playAt(startIndex);
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
    playAt(previous);
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
  toggleMore(): void {
    publish({ moreOpen: !state.moreOpen, devicesOpen: false });
  },
  toggleDevices(): void {
    publish({ devicesOpen: !state.devicesOpen, moreOpen: false });
  },
  toggleFullscreen(): void {
    publish({ fullscreen: !state.fullscreen, moreOpen: false });
  },
  resumeHere(): void {
    if (state.playing) return;
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
  artworkFor(track: PlayerTrack): string | null {
    return track.artworkUrl === null ? null : artworkProxySrc(track.artworkUrl);
  },
};
