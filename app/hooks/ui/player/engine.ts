import {
  attachGraph,
  currentGraph,
  fadeTrackGain,
  resumeGraph,
  setListenerVolume,
  setTrackGain,
  trackGainOf,
} from "./audio-graph";
import {
  HANDOFF_POLL_MS,
  HANDOFF_WATCH_SECONDS,
  LOAD_TIMEOUT_MS,
  OUTGOING_RELEASE_MARGIN_MS,
  SEAM_FADE_SECONDS,
  STALL_TIMEOUT_MS,
} from "./constants";
import { followAudio, stopFollowingAudio } from "./energy";
import { fadeCurveValues, handoffLeadSeconds } from "./transition";
import type { EngineCallbacks, PrimePlan, SkipFade } from "./types";
import type { TransitionCurve } from "@components/Player";

const decks: HTMLAudioElement[] = [];
let active = 0;
let callbacks: EngineCallbacks | null = null;
let generation = 0;
let loadTimer: ReturnType<typeof setTimeout> | undefined;
let stallTimer: ReturnType<typeof setTimeout> | undefined;
let watchTimer: ReturnType<typeof setInterval> | undefined;
let listener = { volume: 1, muted: false };
let primed: PrimePlan | null = null;
let refusedPrimeUrl: string | null = null;
let arriving: { fade: SkipFade; generation: number } | null = null;
let outgoing: { element: HTMLAudioElement; release: ReturnType<typeof setTimeout> } | null = null;

function clearTimers(): void {
  clearTimeout(loadTimer);
  clearTimeout(stallTimer);
}

function armStall(): void {
  clearTimeout(stallTimer);
  stallTimer = setTimeout(() => callbacks?.onFailure("stall"), STALL_TIMEOUT_MS);
}

function isActive(element: HTMLAudioElement): boolean {
  return decks[active] === element;
}

function deck(index: number): HTMLAudioElement {
  const existing = decks[index];
  if (existing !== undefined) return existing;
  const created = new Audio();
  created.preload = "auto";
  created.crossOrigin = "use-credentials";
  wire(created);
  decks[index] = created;
  return created;
}

function activeDeck(): HTMLAudioElement {
  return deck(active);
}

function standbyDeck(): HTMLAudioElement {
  return deck(1 - active);
}

function wire(created: HTMLAudioElement): void {
  created.addEventListener("timeupdate", () => {
    if (!isActive(created)) return;
    clearTimeout(stallTimer);
    callbacks?.onProgress(created.currentTime, durationOf(created));
    watchHandoff(created);
  });
  created.addEventListener("durationchange", () => {
    if (!isActive(created)) return;
    callbacks?.onProgress(created.currentTime, durationOf(created));
  });
  created.addEventListener("loadedmetadata", () => {
    if (!isActive(created)) return;
    clearTimeout(loadTimer);
    callbacks?.onLoadingChange(false);
    callbacks?.onProgress(created.currentTime, durationOf(created));
  });
  created.addEventListener("playing", () => {
    if (!isActive(created)) {
      promoteArriving(created);
      return;
    }
    clearTimers();
    callbacks?.onLoadingChange(false);
    callbacks?.onPlayingChange(true);
    followAudio(created);
  });
  created.addEventListener("pause", () => {
    if (!isActive(created)) return;
    stopFollowingAudio();
    if (created.ended) return;
    callbacks?.onPlayingChange(false);
  });
  created.addEventListener("waiting", () => {
    if (!isActive(created)) return;
    callbacks?.onLoadingChange(true);
    armStall();
  });
  created.addEventListener("stalled", () => {
    if (isActive(created)) armStall();
  });
  created.addEventListener("ended", () => {
    if (!isActive(created)) return;
    if (primed !== null) {
      performHandoff();
      return;
    }
    stopFollowingAudio();
    clearTimers();
    callbacks?.onEnded();
  });
  created.addEventListener("error", () => {
    if (isActive(created)) {
      clearTimers();
      callbacks?.onFailure("load");
      return;
    }
    if (arriving !== null && arriving.generation === generation) {
      arriving = null;
      clearTimers();
      callbacks?.onFailure("load");
      return;
    }
    refusedPrimeUrl = primed?.url ?? refusedPrimeUrl;
    primed = null;
    stopWatching();
  });
}

function stopWatching(): void {
  clearInterval(watchTimer);
  watchTimer = undefined;
}

function durationOf(node: HTMLAudioElement): number {
  return Number.isFinite(node.duration) ? node.duration : 0;
}

function applyElementVolume(node: HTMLAudioElement): void {
  node.volume = Math.min(1, Math.max(0, listener.volume));
  node.muted = listener.muted;
}

function watchHandoff(node: HTMLAudioElement): void {
  if (primed === null || watchTimer !== undefined) return;
  const remaining = node.duration - node.currentTime;
  if (!Number.isFinite(remaining)) return;
  if (remaining > handoffLeadSeconds(primed.fadeSeconds) + HANDOFF_WATCH_SECONDS) return;
  watchTimer = setInterval(checkHandoff, HANDOFF_POLL_MS);
}

function checkHandoff(): void {
  if (primed === null) {
    stopWatching();
    return;
  }
  const node = activeDeck();
  const remaining = node.duration - node.currentTime;
  const lead = handoffLeadSeconds(primed.fadeSeconds);
  if (!Number.isFinite(remaining) || remaining > lead + HANDOFF_WATCH_SECONDS) {
    stopWatching();
    return;
  }
  if (remaining > lead) return;
  performHandoff();
}

function performHandoff(): void {
  const plan = primed;
  if (plan === null) return;
  primed = null;
  stopWatching();
  const leaving = activeDeck();
  const incoming = standbyDeck();
  const fade = plan.fadeSeconds > 0 ? plan.fadeSeconds : SEAM_FADE_SECONDS;
  const blend = crossDecks(leaving, incoming, fade, plan.curve, plan.gainFactor);
  resumeGraph();
  void incoming.play().catch(() => undefined);
  swapTo(incoming, blend);
  if (incoming.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) callbacks?.onLoadingChange(true);
  armLoadTimer(generation);
  callbacks?.onHandoff(plan.url);
}

function crossDecks(
  leaving: HTMLAudioElement,
  incoming: HTMLAudioElement,
  seconds: number,
  curve: TransitionCurve,
  incomingGain: number
): number {
  if (currentGraph() === null) {
    applyElementVolume(incoming);
    return 0;
  }
  fadeTrackGain(leaving, fadeCurveValues(curve, "out", trackGainOf(leaving)), seconds);
  fadeTrackGain(incoming, fadeCurveValues(curve, "in", incomingGain), seconds);
  return seconds;
}

function swapTo(incoming: HTMLAudioElement, blendSeconds: number): void {
  const leaving = activeDeck();
  generation += 1;
  clearTimers();
  stopFollowingAudio();
  dropOutgoing();
  active = decks.indexOf(incoming);
  if (blendSeconds <= 0) {
    releaseDeck(leaving);
    return;
  }
  outgoing = {
    element: leaving,
    release: setTimeout(releaseOutgoing, blendSeconds * 1000 + OUTGOING_RELEASE_MARGIN_MS),
  };
}

function releaseDeck(node: HTMLAudioElement): void {
  node.pause();
  node.removeAttribute("src");
  node.load();
}

function abandonArriving(): void {
  if (arriving === null) return;
  arriving = null;
  releaseDeck(standbyDeck());
}

function releaseOutgoing(): void {
  if (outgoing === null) return;
  const { element } = outgoing;
  outgoing = null;
  releaseDeck(element);
}

function dropOutgoing(): void {
  if (outgoing === null) return;
  clearTimeout(outgoing.release);
  releaseOutgoing();
}

function promoteArriving(node: HTMLAudioElement): void {
  if (arriving === null || arriving.generation !== generation || node !== standbyDeck()) return;
  const { fade } = arriving;
  arriving = null;
  const blend = crossDecks(activeDeck(), node, fade.seconds, fade.curve, fade.gainFactor);
  swapTo(node, blend);
  clearTimers();
  callbacks?.onLoadingChange(false);
  callbacks?.onPlayingChange(true);
  followAudio(node);
}

function commitArriving(): void {
  if (arriving === null) return;
  arriving = null;
  const node = standbyDeck();
  swapTo(node, 0);
  clearTimers();
}

function seekOnceReady(node: HTMLAudioElement, expected: number, seconds: number): void {
  if (seconds <= 0) return;
  const apply = () => {
    node.removeEventListener("loadedmetadata", apply);
    if (expected !== generation) return;
    node.currentTime = seconds;
  };
  node.addEventListener("loadedmetadata", apply);
}

function armLoadTimer(expected: number): void {
  loadTimer = setTimeout(() => {
    if (expected === generation) callbacks?.onFailure("load");
  }, LOAD_TIMEOUT_MS);
}

export function canPlayMime(mimeType: string): boolean {
  return deck(0).canPlayType(mimeType) !== "";
}

export function connectEngine(next: EngineCallbacks): void {
  callbacks = next;
}

export function loadAndPlay(url: string, volume: number, muted: boolean, startSeconds = 0): number {
  dropOutgoing();
  cancelPrime();
  abandonArriving();
  refusedPrimeUrl = null;
  const node = activeDeck();
  const current = ++generation;
  clearTimers();
  node.src = url;
  applyVolume(volume, muted);
  attachGraph(node);
  attachGraph(standbyDeck());
  resumeGraph();
  node.load();
  seekOnceReady(node, current, startSeconds);
  callbacks?.onLoadingChange(true);
  armLoadTimer(current);
  void node.play().catch(() => {
    if (current === generation) callbacks?.onFailure("autoplay");
  });
  return current;
}

export function crossfadeTo(url: string, fade: SkipFade, volume: number, muted: boolean, startSeconds = 0): number {
  if (currentGraph() === null || activeDeck().paused) return loadAndPlay(url, volume, muted, startSeconds);
  dropOutgoing();
  cancelPrime();
  refusedPrimeUrl = null;
  const node = standbyDeck();
  const current = ++generation;
  clearTimers();
  node.src = url;
  applyVolume(volume, muted);
  attachGraph(node);
  setTrackGain(node, 0, true);
  resumeGraph();
  node.load();
  seekOnceReady(node, current, startSeconds);
  arriving = { fade, generation: current };
  callbacks?.onLoadingChange(true);
  armLoadTimer(current);
  void node.play().catch(() => {
    if (current === generation) callbacks?.onFailure("autoplay");
  });
  return current;
}

export function loadAt(url: string, seconds: number, volume: number, muted: boolean): void {
  dropOutgoing();
  cancelPrime();
  abandonArriving();
  refusedPrimeUrl = null;
  const node = activeDeck();
  const current = ++generation;
  clearTimers();
  node.src = url;
  applyVolume(volume, muted);
  node.load();
  seekOnceReady(node, current, seconds);
}

export function prime(plan: PrimePlan): void {
  if (outgoing !== null || arriving !== null || plan.url === refusedPrimeUrl) return;
  if (primed !== null && primed.url === plan.url) {
    primed = plan;
    return;
  }
  const node = standbyDeck();
  primed = plan;
  node.src = plan.url;
  attachGraph(node);
  setTrackGain(node, 0, true);
  node.load();
}

export function cancelPrime(): void {
  stopWatching();
  if (primed === null) return;
  primed = null;
  const node = standbyDeck();
  if (outgoing?.element === node) return;
  releaseDeck(node);
}

export function primedUrl(): string | null {
  return primed?.url ?? null;
}

export function setActiveTrackGain(factor: number): void {
  const node = activeDeck();
  setTrackGain(node, factor, node.paused);
}

export function resume(): void {
  const node = activeDeck();
  const current = generation;
  attachGraph(node);
  resumeGraph();
  void node.play().catch(() => {
    if (current === generation) callbacks?.onFailure("autoplay");
  });
}

export function pause(): void {
  dropOutgoing();
  commitArriving();
  activeDeck().pause();
}

export function seek(seconds: number): void {
  if (!Number.isFinite(seconds)) return;
  dropOutgoing();
  const node = arriving === null ? activeDeck() : standbyDeck();
  node.currentTime = Math.max(0, seconds);
}

export function applyVolume(volume: number, muted: boolean): void {
  listener = { volume, muted };
  if (setListenerVolume(volume, muted)) return;
  applyElementVolume(activeDeck());
  for (const node of decks) applyElementVolume(node);
}

export function stop(): void {
  generation += 1;
  clearTimers();
  dropOutgoing();
  cancelPrime();
  abandonArriving();
  refusedPrimeUrl = null;
  releaseDeck(activeDeck());
}
