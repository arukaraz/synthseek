import { playerActions, playerSnapshot, subscribePlayer } from "@hooks/ui/player";

import { TRACK_PREVIEW } from "./constants";
import { clockOf, isSounding } from "./helpers";
import type { PreviewClip, PreviewClock, PreviewNoticeKind, PreviewSnapshot } from "./types";

const IDLE: PreviewSnapshot = { key: null, status: "idle", failed: new Set(), notice: null };

let snapshot: PreviewSnapshot = IDLE;
let element: HTMLAudioElement | null = null;
let clip: PreviewClip | null = null;
let token = 0;
let heldPlayer = false;
let playerWasPlaying = false;
let unwatch: (() => void) | null = null;
const listeners = new Set<() => void>();

function publish(next: Partial<PreviewSnapshot>): void {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

function onDismissKey(event: KeyboardEvent): void {
  if (event.key !== TRACK_PREVIEW.DISMISS_KEY || clip === null) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  finish("stopped", true);
}

function onPlayerChange(): void {
  const player = playerSnapshot();
  const playing = player.playing;
  if (element !== null && clip !== null) {
    element.muted = player.muted;
    element.volume = player.volume;
  }
  if (player.remote !== null) heldPlayer = false;
  const started = playing && !playerWasPlaying;
  playerWasPlaying = playing;
  if (!started || clip === null) return;
  heldPlayer = false;
  finish("interrupted", false);
}

function watch(): void {
  if (unwatch !== null) return;
  playerWasPlaying = playerSnapshot().playing;
  const stopWatchingPlayer = subscribePlayer(onPlayerChange);
  window.addEventListener("keydown", onDismissKey, true);
  unwatch = () => {
    stopWatchingPlayer();
    window.removeEventListener("keydown", onDismissKey, true);
  };
}

function silence(): void {
  token += 1;
  if (element !== null) {
    element.pause();
    element.removeAttribute("src");
    element.load();
  }
  unwatch?.();
  unwatch = null;
}

function finish(kind: PreviewNoticeKind, resumePlayer: boolean): void {
  const ended = clip;
  if (ended === null) return;
  clip = null;
  silence();
  const resumesPlayer = resumePlayer && heldPlayer;
  heldPlayer = false;
  const failed = kind === "failed" ? new Set(snapshot.failed).add(ended.key) : snapshot.failed;
  publish({
    key: null,
    status: "idle",
    failed,
    notice: { kind, subject: ended.subject, title: ended.title, resumesPlayer },
  });
  if (resumesPlayer) playerActions.resumeHere();
}

function audio(): HTMLAudioElement {
  if (element !== null) return element;
  const created = new Audio();
  created.preload = "none";
  created.addEventListener("playing", () => {
    if (clip === null || snapshot.status === "playing") return;
    publish({
      status: "playing",
      notice: { kind: "playing", subject: clip.subject, title: clip.title, resumesPlayer: heldPlayer },
    });
  });
  created.addEventListener("ended", () => finish("ended", true));
  created.addEventListener("error", () => finish("failed", true));
  element = created;
  return created;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): PreviewSnapshot {
  return snapshot;
}

export function getServerSnapshot(): PreviewSnapshot {
  return IDLE;
}

export function togglePreview(next: PreviewClip): void {
  if (snapshot.failed.has(next.key)) return;
  if (clip !== null && clip.key === next.key && isSounding(snapshot.status)) {
    finish("stopped", true);
    return;
  }

  const player = playerSnapshot();
  if (player.playing) {
    playerActions.pauseHere();
    heldPlayer = true;
  }

  const target = audio();
  token += 1;
  const mine = token;
  clip = next;
  target.muted = player.muted;
  target.volume = player.volume;
  target.src = next.src;
  publish({ key: next.key, status: "loading", notice: null });
  watch();

  let started: unknown;
  try {
    started = target.play();
  } catch {
    finish("failed", true);
    return;
  }
  void Promise.resolve(started).catch((error: unknown) => {
    if (mine !== token) return;
    if (error instanceof DOMException && error.name === TRACK_PREVIEW.ABORT_ERROR_NAME) return;
    finish("failed", true);
  });
}

export function stopPreview(key?: string): void {
  if (clip === null || (key !== undefined && clip.key !== key)) return;
  finish("stopped", true);
}

export function seekPreview(key: string, seconds: number): void {
  if (element === null || clip === null || clip.key !== key) return;
  element.currentTime = Math.max(seconds, 0);
}

export function previewClock(key: string): PreviewClock | null {
  if (element === null || clip === null || clip.key !== key) return null;
  return clockOf(element.currentTime, element.duration, clip.fallbackSeconds);
}

export function resetTrackPreview(): void {
  clip = null;
  heldPlayer = false;
  silence();
  element = null;
  snapshot = IDLE;
  listeners.forEach((listener) => listener());
}
