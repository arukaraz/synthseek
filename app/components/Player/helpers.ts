import {
  LYRIC_BLUR_DISTANCE,
  LYRIC_FAR_DISTANCE,
  RESTART_THRESHOLD_SECONDS,
  WAVE,
  WAVE_CACHE_LIMIT,
} from "./constants";
import type { PlayerLyrics, PlayerRepeat, PlayerView } from "./types";

interface WavePoint {
  x: number;
  y: number;
}

const pathCache = new Map<string, readonly string[]>();

function seedFromId(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 100003;
  }
  return hash;
}

function bell(progress: number, center: number, width: number): number {
  return Math.exp(-Math.pow(progress - center, 2) / (2 * Math.pow(width, 2)));
}

function amplitudeAt(progress: number, phase: number, center: number): number {
  const taper = Math.pow(Math.sin(Math.PI * progress), WAVE.TAPER_EXPONENT);
  const main = bell(progress, center, WAVE.BULGE_WIDTH);
  const echo = 0.62 * bell(progress, Math.min(0.9, 1.08 - center), WAVE.BULGE_WIDTH * 0.85);
  const ripple = Math.sin(progress * 11.3 + phase) * 0.62 + Math.sin(progress * 19.7 + phase * 1.7) * 0.38;
  return taper * (main + echo + WAVE.RIPPLE_SHARE * Math.abs(ripple));
}

function lobePath(seed: number, lobe: number): string {
  const peak = WAVE.LOBE_AMPLITUDES[lobe] ?? WAVE.LOBE_AMPLITUDES[0];
  const phase = seed * 0.09 + (WAVE.LOBE_PHASES[lobe] ?? 0);
  const drift = ((seed % 17) / 17 - 0.5) * 0.18;
  const center = Math.min(0.82, Math.max(0.18, (WAVE.LOBE_CENTERS[lobe] ?? 0.5) + drift));
  const step = WAVE.VIEWBOX_WIDTH / WAVE.SEGMENTS;
  const raw: number[] = [];

  for (let index = 0; index <= WAVE.SEGMENTS; index += 1) {
    raw.push(amplitudeAt(index / WAVE.SEGMENTS, phase, center));
  }

  const loudest = Math.max(...raw, 0.0001);
  const amplitudes = raw.map((value) => (value / loudest) * peak);

  const top = amplitudes.map((amplitude, index) => ({ x: index * step, y: WAVE.CENTER - amplitude }));
  const bottom = amplitudes.map((amplitude, index) => ({ x: index * step, y: WAVE.CENTER + amplitude })).reverse();

  return closedCurveThrough([...top, ...bottom]);
}

function pointAt(points: readonly WavePoint[], index: number): WavePoint {
  const wrapped = ((index % points.length) + points.length) % points.length;
  return points[wrapped] ?? { x: 0, y: WAVE.CENTER };
}

function closedCurveThrough(points: readonly WavePoint[]): string {
  const first = pointAt(points, 0);
  const commands = [`M${first.x.toFixed(1)},${first.y.toFixed(1)}`];

  for (let index = 0; index < points.length; index += 1) {
    const previous = pointAt(points, index - 1);
    const current = pointAt(points, index);
    const next = pointAt(points, index + 1);
    const after = pointAt(points, index + 2);

    const firstControl = {
      x: current.x + ((next.x - previous.x) / 6) * WAVE.SMOOTHING,
      y: current.y + ((next.y - previous.y) / 6) * WAVE.SMOOTHING,
    };
    const secondControl = {
      x: next.x - ((after.x - current.x) / 6) * WAVE.SMOOTHING,
      y: next.y - ((after.y - current.y) / 6) * WAVE.SMOOTHING,
    };

    commands.push(
      `C${firstControl.x.toFixed(1)},${firstControl.y.toFixed(1)} ${secondControl.x.toFixed(1)},${secondControl.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`
    );
  }

  return `${commands.join(" ")} Z`;
}

export function waveLobePaths(trackId: string): readonly string[] {
  const cached = pathCache.get(trackId);
  if (cached) return cached;

  const seed = seedFromId(trackId);
  const paths = WAVE.LOBE_AMPLITUDES.map((_, lobe) => lobePath(seed, lobe));
  if (pathCache.size >= WAVE_CACHE_LIMIT) {
    const oldest = pathCache.keys().next();
    if (!oldest.done) pathCache.delete(oldest.value);
  }
  pathCache.set(trackId, paths);
  return paths;
}

export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const padded = String(rest).padStart(2, "0");
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${padded}`;
  return `${minutes}:${padded}`;
}

export function trackInitials(album: string): string {
  const words = album
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word.slice(0, 1).toUpperCase());
  return initials.join("") || "?";
}

export function percentOf(seconds: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return Math.min(100, Math.max(0, (seconds / durationSeconds) * 100));
}

export function nextRepeat(repeat: PlayerRepeat): PlayerRepeat {
  if (repeat === "off") return "all";
  if (repeat === "all") return "one";
  return "off";
}

export function shouldRestart(positionSeconds: number): boolean {
  return positionSeconds > RESTART_THRESHOLD_SECONDS;
}

export function secondsFromPointer(clientX: number, rect: DOMRect, durationSeconds: number): number {
  if (rect.width <= 0) return 0;
  const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  return fraction * durationSeconds;
}

export function fractionFromPointer(clientX: number, rect: DOMRect): number {
  if (rect.width <= 0) return 0;
  return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
}

export function returnFocusTo(selector: string): void {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(selector));
  candidates.find((candidate) => candidate.getClientRects().length > 0)?.focus();
}

export function lyricLineState(
  lyrics: PlayerLyrics | null,
  active: number | null,
  index: number
): "active" | "resting" | "plain" {
  if (lyrics === null || !lyrics.synced) return "plain";
  return index === active ? "active" : "resting";
}

export function activeLyricIndex(lyrics: PlayerLyrics | null, positionSeconds: number): number | null {
  if (lyrics === null || !lyrics.synced) return null;
  const positionMs = positionSeconds * 1000;
  let active: number | null = null;
  for (const [index, line] of lyrics.lines.entries()) {
    if (line.start === null || line.start > positionMs) break;
    active = index;
  }
  return active;
}

export function emptyReason(view: Pick<PlayerView, "lyricsLoading" | "lyricsFailed">): "loading" | "failed" | "empty" {
  if (view.lyricsLoading) return "loading";
  if (view.lyricsFailed) return "failed";
  return "empty";
}

export function lyricDepth(active: number | null, index: number): "near" | "mid" | "far" {
  const distance = active === null ? 0 : Math.abs(index - active);
  if (distance >= LYRIC_FAR_DISTANCE) return "far";
  if (distance >= LYRIC_BLUR_DISTANCE) return "mid";
  return "near";
}
