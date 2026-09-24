import {
  attachBus,
  fadeTrackGain,
  liveTrackGain,
  releaseDeck,
  resumeGraph,
  setListenerVolume,
  setTrackGain,
  trackGainOf,
} from "./audio-graph";
import {
  LOAD_TIMEOUT_MS,
  OUTGOING_RELEASE_MARGIN_MS,
  PCM_FEED_TICK_MS,
  PCM_LEAD_SECONDS,
  PCM_PROGRESS_MS,
  PCM_START_LEAD_SECONDS,
} from "./constants";
import { followGraph, stopFollowingAudio } from "./energy";
import { keepAlive, releaseKeepAlive } from "./keepalive";
import { clipBuffer, leadFilled, positionOf, roundToSample } from "./pcm-schedule";
import { openPcmSource } from "./pcm-source";
import { pcmCanPlay } from "./pcm-support";
import { fadeCurveValues } from "./transition";
import type { AudioBus, EngineCallbacks, PcmBuffer, PcmSource, PcmVoiceKey, PrimePlan, SkipFade } from "./types";

interface Voice {
  key: PcmVoiceKey;
  source: PcmSource;
  bus: AudioBus;
  nodes: Set<AudioBufferSourceNode>;
  base: number;
  scheduledUntil: number;
  fed: boolean;
  iterator: AsyncGenerator<PcmBuffer, void, unknown> | null;
  announced: boolean;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

let callbacks: EngineCallbacks | null = null;
let generation = 0;
let voiceCount = 0;
let active: Voice | null = null;
let primed: { plan: PrimePlan; voice: Voice } | null = null;
let outgoing: { voice: Voice; release: ReturnType<typeof setTimeout> } | null = null;
let pausedAt: number | null = null;
let playing = false;
let activeGain = 1;
let refusedPrimeUrl: string | null = null;
let loadTimer: ReturnType<typeof setTimeout> | undefined;
let progressTimer: ReturnType<typeof setInterval> | undefined;
let seamRun = 0;

async function open(url: string): Promise<Voice> {
  const key: PcmVoiceKey = { voice: ++voiceCount };
  const bus = attachBus(key);
  if (bus === null) throw new Error("no audio graph");
  try {
    const source = await openPcmSource(url);
    return {
      key,
      source,
      bus,
      nodes: new Set(),
      base: 0,
      scheduledUntil: 0,
      fed: false,
      iterator: null,
      announced: false,
    };
  } catch (error) {
    releaseDeck(key);
    throw error;
  }
}

function stopNodes(voice: Voice): void {
  void voice.iterator?.return();
  voice.iterator = null;
  for (const node of voice.nodes) {
    try {
      node.stop();
    } catch {
      continue;
    }
  }
  voice.nodes.clear();
  voice.fed = false;
}

function disposeVoice(voice: Voice): void {
  stopNodes(voice);
  voice.source.dispose();
  releaseDeck(voice.key);
}

function dropOutgoing(): void {
  if (outgoing === null) return;
  clearTimeout(outgoing.release);
  disposeVoice(outgoing.voice);
  outgoing = null;
}

function retireActive(): void {
  if (active === null) return;
  disposeVoice(active);
  active = null;
}

function primedScheduled(): boolean {
  return primed !== null && (primed.voice.iterator !== null || primed.voice.fed);
}

function restoreActiveGain(immediate: boolean): void {
  if (active !== null) setTrackGain(active.key, activeGain, immediate);
}

function discardPrimed(): void {
  if (primed === null) return;
  const scheduled = primedScheduled();
  disposeVoice(primed.voice);
  primed = null;
  if (scheduled) restoreActiveGain(false);
}

function reschedulePrimed(): void {
  if (primed === null || !primedScheduled()) return;
  stopNodes(primed.voice);
  restoreActiveGain(false);
  if (active !== null && active.fed && playing) beginPrimedFeed(active);
}

function samePlan(a: PrimePlan, b: PrimePlan): boolean {
  return a.url === b.url && a.gainFactor === b.gainFactor && a.fadeSeconds === b.fadeSeconds && a.curve === b.curve;
}

function currentPosition(voice: Voice): number {
  return positionOf(voice.base, voice.bus.context.currentTime, voice.source.durationSeconds);
}

function startVoice(voice: Voice, fromSeconds: number, baseTime?: number): void {
  const context = voice.bus.context;
  voice.base = (baseTime ?? context.currentTime + PCM_START_LEAD_SECONDS) - fromSeconds;
  voice.scheduledUntil = fromSeconds;
  voice.fed = false;
  void feed(voice, fromSeconds);
}

async function feed(voice: Voice, fromSeconds: number): Promise<void> {
  const context = voice.bus.context;
  const iterator = voice.source.buffers(fromSeconds);
  voice.iterator = iterator;
  try {
    for await (const { buffer, timestamp, duration } of iterator) {
      if (voice.iterator !== iterator) return;
      const clip = clipBuffer(timestamp, duration, voice.source.trimStartSeconds, voice.source.durationSeconds);
      if (clip === null) continue;
      let when = roundToSample(voice.base + clip.startSeconds, context.sampleRate);
      if (when < context.currentTime) {
        const late = context.currentTime - when + PCM_START_LEAD_SECONDS;
        voice.base += late;
        when = roundToSample(when + late, context.sampleRate);
      }
      const node = context.createBufferSource();
      node.buffer = buffer;
      node.connect(voice.bus.gain);
      node.start(when, clip.offsetSeconds, clip.playSeconds);
      voice.nodes.add(node);
      node.onended = () => {
        voice.nodes.delete(node);
      };
      voice.scheduledUntil = clip.startSeconds + clip.playSeconds;
      announce(voice);
      while (
        voice.iterator === iterator &&
        leadFilled(voice.scheduledUntil, currentPosition(voice), PCM_LEAD_SECONDS)
      ) {
        await sleep(PCM_FEED_TICK_MS);
      }
    }
  } catch {
    if (voice.iterator === iterator) failVoice(voice);
    return;
  }
  if (voice.iterator !== iterator) return;
  voice.iterator = null;
  voice.fed = true;
  if (voice === active) void watchSeam(voice, ++seamRun);
}

function announce(voice: Voice): void {
  if (voice !== active || voice.announced) return;
  voice.announced = true;
  clearTimeout(loadTimer);
  callbacks?.onLoadingChange(false);
  callbacks?.onPlayingChange(true);
  followGraph();
}

function failVoice(voice: Voice): void {
  if (voice === active) {
    clearTimeout(loadTimer);
    callbacks?.onFailure("load");
    return;
  }
  if (primed?.voice === voice) {
    refusedPrimeUrl = primed.plan.url;
    discardPrimed();
  }
}

function endOf(voice: Voice): number {
  return voice.base + (voice.fed ? voice.scheduledUntil : voice.source.durationSeconds);
}

function seamTarget(voice: Voice): number {
  const endAt = endOf(voice);
  return primed === null ? endAt : endAt - primed.plan.fadeSeconds;
}

function beginPrimedFeed(voice: Voice): void {
  if (primed === null || primed.voice.iterator !== null || primed.voice.fed) return;
  const { plan } = primed;
  const endAt = endOf(voice);
  const incoming = primed.voice;
  if (plan.fadeSeconds > 0) {
    const at = endAt - plan.fadeSeconds;
    setTrackGain(incoming.key, 0, true);
    fadeTrackGain(incoming.key, fadeCurveValues(plan.curve, "in", plan.gainFactor), plan.fadeSeconds, at);
    fadeTrackGain(voice.key, fadeCurveValues(plan.curve, "out", trackGainOf(voice.key)), plan.fadeSeconds, at);
    startVoice(incoming, 0, at);
    return;
  }
  setTrackGain(incoming.key, plan.gainFactor, true);
  startVoice(incoming, 0, endAt);
}

async function watchSeam(voice: Voice, run: number): Promise<void> {
  const context = voice.bus.context;
  beginPrimedFeed(voice);
  while (voice === active && run === seamRun && playing) {
    const target = seamTarget(voice);
    const remaining = target - context.currentTime;
    if (remaining <= 0) break;
    await sleep(Math.max(5, Math.min(PCM_FEED_TICK_MS, remaining * 1000)));
  }
  if (voice !== active || run !== seamRun || !playing) return;
  if (primed === null) {
    finishActive(voice);
    return;
  }
  handOver(voice);
}

function finishActive(voice: Voice): void {
  stopProgress();
  stopNodes(voice);
  playing = false;
  pausedAt = voice.source.durationSeconds;
  releaseKeepAlive();
  stopFollowingAudio();
  callbacks?.onProgress(voice.source.durationSeconds, voice.source.durationSeconds);
  callbacks?.onEnded();
}

function handOver(voice: Voice): void {
  if (primed === null) return;
  const { plan, voice: incoming } = primed;
  primed = null;
  generation += 1;
  dropOutgoing();
  outgoing = {
    voice,
    release: setTimeout(dropOutgoing, plan.fadeSeconds * 1000 + OUTGOING_RELEASE_MARGIN_MS),
  };
  active = incoming;
  activeGain = plan.gainFactor;
  const sounding = incoming.scheduledUntil > 0;
  incoming.announced = sounding;
  if (!sounding) {
    callbacks?.onLoadingChange(true);
    armLoadTimer(generation);
  }
  callbacks?.onHandoff(plan.url);
  if (incoming.fed) void watchSeam(incoming, ++seamRun);
}

function startProgress(): void {
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (active === null || !playing) return;
    callbacks?.onProgress(currentPosition(active), active.source.durationSeconds);
  }, PCM_PROGRESS_MS);
}

function stopProgress(): void {
  clearInterval(progressTimer);
  progressTimer = undefined;
}

function armLoadTimer(expected: number): void {
  clearTimeout(loadTimer);
  loadTimer = setTimeout(() => {
    if (expected === generation) callbacks?.onFailure("load");
  }, LOAD_TIMEOUT_MS);
}

function beginPlaying(voice: Voice, fromSeconds: number): void {
  playing = true;
  pausedAt = null;
  resumeGraph();
  keepAlive();
  startProgress();
  startVoice(voice, fromSeconds);
}

function takePrimedAs(url: string): Voice | null {
  if (primed === null || primed.plan.url !== url) return null;
  const { voice } = primed;
  primed = null;
  stopNodes(voice);
  return voice;
}

export function canPlayMime(mimeType: string): boolean {
  return pcmCanPlay(mimeType);
}

export function connectEngine(next: EngineCallbacks): void {
  callbacks = next;
}

export function loadAndPlay(url: string, volume: number, muted: boolean, startSeconds = 0): number {
  const current = ++generation;
  dropOutgoing();
  const reused = takePrimedAs(url);
  discardPrimed();
  retireActive();
  refusedPrimeUrl = null;
  playing = false;
  applyVolume(volume, muted);
  callbacks?.onLoadingChange(true);
  armLoadTimer(current);
  void (reused === null ? open(url) : Promise.resolve(reused))
    .then((voice) => {
      if (current !== generation) {
        disposeVoice(voice);
        return;
      }
      voice.announced = false;
      active = voice;
      setTrackGain(voice.key, activeGain, true);
      beginPlaying(voice, startSeconds);
    })
    .catch(() => {
      if (current === generation) {
        clearTimeout(loadTimer);
        callbacks?.onFailure("load");
      }
    });
  return current;
}

export function crossfadeTo(url: string, fade: SkipFade, volume: number, muted: boolean, startSeconds = 0): number {
  const leaving = active;
  if (leaving === null || !playing) return loadAndPlay(url, volume, muted, startSeconds);
  const current = ++generation;
  dropOutgoing();
  discardPrimed();
  refusedPrimeUrl = null;
  applyVolume(volume, muted);
  callbacks?.onLoadingChange(true);
  armLoadTimer(current);
  void open(url)
    .then((voice) => {
      if (current !== generation || active !== leaving) {
        disposeVoice(voice);
        return;
      }
      const at = voice.bus.context.currentTime + PCM_START_LEAD_SECONDS;
      setTrackGain(voice.key, 0, true);
      fadeTrackGain(voice.key, fadeCurveValues(fade.curve, "in", fade.gainFactor), fade.seconds, at);
      fadeTrackGain(leaving.key, fadeCurveValues(fade.curve, "out", liveTrackGain(leaving.key)), fade.seconds, at);
      outgoing = {
        voice: leaving,
        release: setTimeout(dropOutgoing, fade.seconds * 1000 + OUTGOING_RELEASE_MARGIN_MS),
      };
      active = voice;
      activeGain = fade.gainFactor;
      startVoice(voice, startSeconds, at);
      seamRun += 1;
    })
    .catch(() => {
      if (current === generation) {
        clearTimeout(loadTimer);
        callbacks?.onFailure("load");
      }
    });
  return current;
}

export function loadAt(url: string, seconds: number, volume: number, muted: boolean): void {
  const current = ++generation;
  dropOutgoing();
  discardPrimed();
  retireActive();
  refusedPrimeUrl = null;
  playing = false;
  stopProgress();
  applyVolume(volume, muted);
  void open(url)
    .then((voice) => {
      if (current !== generation) {
        disposeVoice(voice);
        return;
      }
      active = voice;
      pausedAt = Math.min(Math.max(0, seconds), voice.source.durationSeconds);
      setTrackGain(voice.key, activeGain, true);
      callbacks?.onLoadingChange(false);
      callbacks?.onProgress(pausedAt, voice.source.durationSeconds);
    })
    .catch(() => {
      if (current === generation) callbacks?.onFailure("load");
    });
}

export function prime(plan: PrimePlan): void {
  if (plan.url === refusedPrimeUrl || outgoing !== null) return;
  if (primed !== null && primed.plan.url === plan.url) {
    if (samePlan(primed.plan, plan)) return;
    primed.plan = plan;
    reschedulePrimed();
    return;
  }
  discardPrimed();
  const current = generation;
  void open(plan.url)
    .then((voice) => {
      if (current !== generation || primed !== null || active === null) {
        disposeVoice(voice);
        return;
      }
      primed = { plan, voice };
      if (active.fed && playing) beginPrimedFeed(active);
    })
    .catch(() => {
      if (current === generation) refusedPrimeUrl = plan.url;
    });
}

export function cancelPrime(): void {
  discardPrimed();
}

export function primedUrl(): string | null {
  return primed?.plan.url ?? null;
}

export function setActiveTrackGain(factor: number): void {
  activeGain = factor;
  if (active === null) return;
  setTrackGain(active.key, factor, !playing);
  reschedulePrimed();
}

export function resume(): void {
  if (active === null || playing) return;
  const from = pausedAt ?? 0;
  const restart = from >= active.source.durationSeconds ? 0 : from;
  beginPlaying(active, restart);
  callbacks?.onPlayingChange(true);
}

export function pause(): void {
  if (active === null || !playing) return;
  pausedAt = currentPosition(active);
  playing = false;
  seamRun += 1;
  dropOutgoing();
  stopNodes(active);
  if (primed !== null) stopNodes(primed.voice);
  restoreActiveGain(true);
  stopProgress();
  releaseKeepAlive();
  stopFollowingAudio();
  callbacks?.onPlayingChange(false);
}

export function seek(seconds: number): void {
  if (active === null || !Number.isFinite(seconds)) return;
  const target = Math.min(Math.max(0, seconds), active.source.durationSeconds);
  if (!playing) {
    pausedAt = target;
    callbacks?.onProgress(target, active.source.durationSeconds);
    return;
  }
  seamRun += 1;
  dropOutgoing();
  stopNodes(active);
  if (primed !== null) stopNodes(primed.voice);
  restoreActiveGain(true);
  startVoice(active, target);
  callbacks?.onProgress(target, active.source.durationSeconds);
}

export function applyVolume(volume: number, muted: boolean): void {
  setListenerVolume(volume, muted);
}

export function stop(): void {
  generation += 1;
  seamRun += 1;
  clearTimeout(loadTimer);
  stopProgress();
  dropOutgoing();
  discardPrimed();
  retireActive();
  refusedPrimeUrl = null;
  playing = false;
  pausedAt = null;
  releaseKeepAlive();
  stopFollowingAudio();
}
