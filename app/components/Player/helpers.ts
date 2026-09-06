import {
  ALL_PLAYER_MODES,
  LYRIC_BLUR_DISTANCE,
  LYRIC_FAR_DISTANCE,
  RESTART_THRESHOLD_SECONDS,
  RESTORABLE_PLAYER_MODES,
  WAVE,
} from "./constants";
import type {
  PlayerLyrics,
  PlayerMode,
  PlayerRepeat,
  PlayerView,
  WaveCanvas,
  WaveColors,
  WavePaint,
  WaveSurface,
} from "./types";

const TURN = Math.PI * 2;

const COLOR_TOKENS = [
  "var(--color-primary-400)",
  "var(--color-secondary-400)",
  "var(--color-accent-400)",
  "var(--color-fg)",
  "var(--color-surface-overlay)",
  "var(--color-primary-foreground)",
] as const;

export function wavePhase(trackId: string): number {
  let hash = 0;
  for (let index = 0; index < trackId.length; index += 1) {
    hash = (hash * 31 + trackId.charCodeAt(index)) % 100003;
  }
  return (hash / 100003) * TURN;
}

export function waveEnvelope(x: number, width: number): number {
  if (width <= 0) return 0;
  return Math.pow(Math.cos((((x / width) * 2 - 1) * Math.PI) / 2), WAVE.ENVELOPE_EXPONENT);
}

export function softLimit(value: number, limit: number): number {
  if (limit <= 0) return 0;
  const bend = limit * WAVE.LIMIT_KNEE;
  if (value <= bend) return value;
  const room = limit - bend;
  return bend + room * (1 - Math.exp(-(value - bend) / room));
}

export function followed(current: number, target: number, elapsedMs: number, timeConstantMs: number): number {
  if (elapsedMs <= 0) return current;
  return current + (target - current) * (1 - Math.exp(-elapsedMs / timeConstantMs));
}

export function waveColors(host: HTMLElement): WaveColors {
  const probe = document.createElement("span");
  probe.style.setProperty("position", "absolute");
  probe.style.setProperty("opacity", "0");
  probe.style.setProperty("pointer-events", "none");
  probe.style.setProperty("font-family", "var(--font-mono)");
  host.appendChild(probe);
  const resolved = COLOR_TOKENS.map((token) => {
    probe.style.setProperty("color", token);
    return window.getComputedStyle(probe).color;
  });
  const mono = window.getComputedStyle(probe).fontFamily;
  probe.remove();
  const [primary = "", secondary = "", accent = "", foreground = "", surface = "", primaryForeground = ""] = resolved;
  return { lobes: [primary, secondary, accent], primary, foreground, surface, primaryForeground, mono };
}

function strokeLobes(
  context: WaveSurface,
  paint: WavePaint,
  gain: number,
  alpha: number,
  colors: readonly string[]
): void {
  const middle = paint.height / 2;
  const lineWidth = Math.max(WAVE.MIN_LINE_WIDTH_PX, paint.height * WAVE.LINE_WIDTH_SHARE);
  const reach = softLimit(gain * paint.height * WAVE.HEIGHT_SHARE, middle - lineWidth / 2);

  WAVE.LOBES.forEach((lobe, index) => {
    const tone = colors[index] ?? colors[0] ?? "";
    const phase = paint.phase + index * WAVE.LOBE_PHASE_STEP - paint.time * lobe.speed;
    context.beginPath();
    for (let x = 0; x <= paint.width; x += WAVE.SAMPLE_STEP_PX) {
      const offset =
        waveEnvelope(x, paint.width) *
        lobe.amplitude *
        reach *
        Math.sin((x / paint.width) * TURN * lobe.frequency + phase);
      if (x === 0) context.moveTo(x, middle - offset);
      else context.lineTo(x, middle - offset);
    }
    context.strokeStyle = tone;
    context.shadowColor = tone;
    context.lineWidth = lineWidth;
    context.shadowBlur = paint.height * WAVE.GLOW_SHARE;
    context.globalAlpha = alpha;
    context.stroke();
    context.stroke();
  });

  context.shadowBlur = 0;
  context.globalAlpha = 1;
}

function paintTag(context: WaveSurface, paint: WavePaint, x: number, emphasis: boolean): void {
  const fontSize = emphasis ? WAVE.TAG_DRAG_FONT_PX : WAVE.TAG_HOVER_FONT_PX;
  const height = emphasis ? WAVE.TAG_DRAG_HEIGHT_PX : WAVE.TAG_HOVER_HEIGHT_PX;
  context.font = `${fontSize}px ${paint.colors.mono}`;
  const width =
    context.measureText(paint.label).width + (emphasis ? WAVE.TAG_DRAG_PADDING_PX : WAVE.TAG_HOVER_PADDING_PX);
  const left = Math.max(WAVE.TAG_INSET_PX, Math.min(paint.width - width - WAVE.TAG_INSET_PX, x - width / 2));

  context.globalAlpha = 1;
  context.fillStyle = emphasis ? paint.colors.primary : paint.colors.surface;
  context.beginPath();
  context.roundRect(left, WAVE.TAG_INSET_PX, width, height, height / 2);
  context.fill();
  if (!emphasis) {
    context.strokeStyle = paint.colors.primary;
    context.lineWidth = 1;
    context.globalAlpha = WAVE.TAG_BORDER_ALPHA;
    context.stroke();
  }

  context.fillStyle = emphasis ? paint.colors.primaryForeground : paint.colors.foreground;
  context.globalAlpha = emphasis ? 1 : WAVE.TAG_TEXT_ALPHA;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.fillText(paint.label, left + width / 2, WAVE.TAG_INSET_PX + height / 2 + 0.5);
  context.globalAlpha = 1;
}

export function paintWave(context: WaveSurface, offscreen: WaveCanvas, paint: WavePaint): void {
  const played = offscreen.getContext("2d");
  if (played === null || paint.width <= 0 || paint.height <= 0) return;

  context.save();
  played.save();
  context.setTransform(paint.ratio, 0, 0, paint.ratio, 0, 0);
  context.clearRect(0, 0, paint.width, paint.height);

  const middle = Math.round(paint.height / 2) - 0.5;
  const headX = paint.progress * paint.width;
  const gain = paint.energy * (paint.dragging ? WAVE.DRAG_GAIN : 1);
  const lit = paint.hover !== null || paint.dragging;

  context.fillStyle = paint.colors.foreground;
  context.globalAlpha = lit ? 1 : WAVE.BASELINE_ALPHA;
  if (lit) {
    context.shadowColor = paint.colors.foreground;
    context.shadowBlur = WAVE.BASELINE_GLOW_PX;
  }
  context.fillRect(0, lit ? middle - 0.5 : middle, paint.width, lit ? WAVE.BASELINE_LIT_HEIGHT_PX : 1);
  context.shadowBlur = 0;
  context.globalAlpha = 1;

  strokeLobes(context, paint, gain * WAVE.REST_AMPLITUDE_SHARE, WAVE.REST_ALPHA, paint.colors.lobes);

  played.setTransform(paint.ratio, 0, 0, paint.ratio, 0, 0);
  played.clearRect(0, 0, paint.width, paint.height);
  strokeLobes(played, paint, gain, WAVE.PLAYED_ALPHA, paint.colors.lobes);
  const fade = Math.max(WAVE.MIN_FADE_PX, paint.width * WAVE.FADE_SHARE);
  const mask = played.createLinearGradient(headX - fade, 0, headX + fade, 0);
  mask.addColorStop(0, "rgba(0, 0, 0, 1)");
  mask.addColorStop(0.5, `rgba(0, 0, 0, ${WAVE.FADE_MIDPOINT_ALPHA})`);
  mask.addColorStop(1, "rgba(0, 0, 0, 0)");
  played.globalCompositeOperation = "destination-in";
  played.fillStyle = mask;
  played.fillRect(0, 0, paint.width, paint.height);
  played.globalCompositeOperation = "source-over";
  context.drawImage(offscreen, 0, 0, paint.width, paint.height);

  if (paint.dragging && paint.origin !== null) {
    context.setLineDash([...WAVE.ORIGIN_DASH_PX]);
    context.strokeStyle = paint.colors.foreground;
    context.globalAlpha = WAVE.ORIGIN_ALPHA;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(paint.origin * paint.width, 0);
    context.lineTo(paint.origin * paint.width, paint.height);
    context.stroke();
    context.setLineDash([]);
    context.globalAlpha = 1;
  }

  if (paint.hover !== null && !paint.dragging) paintTag(context, paint, paint.hover * paint.width, false);

  const scale = paint.dragging ? WAVE.DRAG_HEAD_SCALE : paint.hover !== null ? WAVE.HOVER_HEAD_SCALE : 1;
  context.fillStyle = paint.colors.foreground;
  context.shadowColor = paint.colors.primary;
  context.shadowBlur = WAVE.HEAD_GLOW_PX * scale;
  context.beginPath();
  context.arc(headX, middle + 0.5, Math.max(WAVE.MIN_HEAD_PX, paint.height * WAVE.HEAD_SHARE) * scale, 0, TURN);
  context.fill();
  context.shadowBlur = 0;

  if (paint.dragging) paintTag(context, paint, headX, true);
  played.restore();
  context.restore();
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

export function fractionOf(seconds: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return Math.min(1, Math.max(0, seconds / durationSeconds));
}

export function percentOf(seconds: number, durationSeconds: number): number {
  return fractionOf(seconds, durationSeconds) * 100;
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
  candidates
    .find((candidate) => candidate.getClientRects().length > 0 && getComputedStyle(candidate).visibility !== "hidden")
    ?.focus();
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

export function emptyReason(view: Pick<PlayerView, "lyricsLoading" | "lyricsFailure">): "loading" | "empty" {
  return view.lyricsLoading ? "loading" : "empty";
}

export function labelled(label: string): { "aria-label": string; title: string } {
  return { "aria-label": label, title: label };
}

export function effectivePlayerMode(mode: PlayerMode, target: HTMLElement | null): PlayerMode {
  return target === null ? "normal" : mode;
}

export function restorablePlayerMode(value: string | null): PlayerMode | null {
  const known = ALL_PLAYER_MODES.find((mode) => mode === value);
  if (known === undefined || !RESTORABLE_PLAYER_MODES.includes(known)) return null;
  return known;
}

export function lyricDepth(active: number | null, index: number): "near" | "mid" | "far" {
  const distance = active === null ? 0 : Math.abs(index - active);
  if (distance >= LYRIC_FAR_DISTANCE) return "far";
  if (distance >= LYRIC_BLUR_DISTANCE) return "mid";
  return "near";
}
