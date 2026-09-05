import { LOAD_TIMEOUT_MS, STALL_TIMEOUT_MS } from "./constants";
import { followAudio, stopFollowingAudio } from "./energy";
import type { EngineCallbacks } from "./types";

let element: HTMLAudioElement | null = null;
let callbacks: EngineCallbacks | null = null;
let generation = 0;
let loadTimer: ReturnType<typeof setTimeout> | undefined;
let stallTimer: ReturnType<typeof setTimeout> | undefined;

function clearTimers(): void {
  clearTimeout(loadTimer);
  clearTimeout(stallTimer);
}

function armStall(): void {
  clearTimeout(stallTimer);
  stallTimer = setTimeout(() => callbacks?.onFailure("stall"), STALL_TIMEOUT_MS);
}

function audio(): HTMLAudioElement {
  if (element !== null) return element;
  const created = new Audio();
  created.preload = "auto";
  created.crossOrigin = "use-credentials";

  created.addEventListener("timeupdate", () => {
    clearTimeout(stallTimer);
    callbacks?.onProgress(created.currentTime, durationOf(created));
  });
  created.addEventListener("durationchange", () => {
    callbacks?.onProgress(created.currentTime, durationOf(created));
  });
  created.addEventListener("loadedmetadata", () => {
    clearTimeout(loadTimer);
    callbacks?.onLoadingChange(false);
    callbacks?.onProgress(created.currentTime, durationOf(created));
  });
  created.addEventListener("playing", () => {
    clearTimers();
    callbacks?.onLoadingChange(false);
    callbacks?.onPlayingChange(true);
    followAudio(created);
  });
  created.addEventListener("pause", () => {
    stopFollowingAudio();
    if (created.ended) return;
    callbacks?.onPlayingChange(false);
  });
  created.addEventListener("waiting", () => {
    callbacks?.onLoadingChange(true);
    armStall();
  });
  created.addEventListener("stalled", armStall);
  created.addEventListener("ended", () => {
    stopFollowingAudio();
    clearTimers();
    callbacks?.onEnded();
  });
  created.addEventListener("error", () => {
    clearTimers();
    callbacks?.onFailure("load");
  });

  element = created;
  return created;
}

function durationOf(node: HTMLAudioElement): number {
  return Number.isFinite(node.duration) ? node.duration : 0;
}

export function canPlayMime(mimeType: string): boolean {
  return audio().canPlayType(mimeType) !== "";
}

export function connectEngine(next: EngineCallbacks): void {
  callbacks = next;
}

export function loadAndPlay(url: string, volume: number, muted: boolean, startSeconds = 0): number {
  const node = audio();
  const current = ++generation;
  clearTimers();
  node.src = url;
  node.volume = volume;
  node.muted = muted;
  node.load();
  seekOnceReady(node, current, startSeconds);
  callbacks?.onLoadingChange(true);
  loadTimer = setTimeout(() => {
    if (current === generation) callbacks?.onFailure("load");
  }, LOAD_TIMEOUT_MS);
  void node.play().catch(() => {
    if (current === generation) callbacks?.onFailure("autoplay");
  });
  return current;
}

export function loadAt(url: string, seconds: number, volume: number, muted: boolean): void {
  const node = audio();
  const current = ++generation;
  clearTimers();
  node.src = url;
  node.volume = volume;
  node.muted = muted;
  node.load();
  seekOnceReady(node, current, seconds);
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

export function resume(): void {
  const node = audio();
  const current = generation;
  void node.play().catch(() => {
    if (current === generation) callbacks?.onFailure("autoplay");
  });
}

export function pause(): void {
  audio().pause();
}

export function seek(seconds: number): void {
  const node = audio();
  if (!Number.isFinite(seconds)) return;
  node.currentTime = Math.max(0, seconds);
}

export function applyVolume(volume: number, muted: boolean): void {
  const node = audio();
  node.volume = Math.min(1, Math.max(0, volume));
  node.muted = muted;
}

export function stop(): void {
  const node = audio();
  generation += 1;
  clearTimers();
  node.pause();
  node.removeAttribute("src");
  node.load();
}
