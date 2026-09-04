import { CONVERTED_BITRATE_KBPS, CONVERTED_FORMAT, PLAYBACK_MIME_BY_FORMAT } from "./constants";
import type { PlayerSessionState } from "./types";

export function streamUrlFor(trackId: string, converted: boolean, offsetSeconds: number): string {
  const base = `/api/v1/library/tracks/${encodeURIComponent(trackId)}/stream`;
  if (!converted) return base;
  const query = new URLSearchParams({ format: CONVERTED_FORMAT, maxBitrate: String(CONVERTED_BITRATE_KBPS) });
  if (offsetSeconds > 0) query.set("offset", String(Math.floor(offsetSeconds)));
  return `${base}?${query.toString()}`;
}

export function needsConversion(format: string, canPlay: (mimeType: string) => boolean): boolean {
  const mimeType = PLAYBACK_MIME_BY_FORMAT[format.toLowerCase()];
  if (mimeType === undefined) return true;
  return !canPlay(mimeType);
}

export function shuffledOrder(length: number, startIndex: number): number[] {
  const rest = Array.from({ length }, (_, index) => index).filter((index) => index !== startIndex);
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = rest[i];
    rest[i] = rest[j] ?? swap ?? 0;
    rest[j] = swap ?? 0;
  }
  return [startIndex, ...rest];
}

export function nextIndexIn(state: PlayerSessionState): number | null {
  if (state.queue.length === 0) return null;
  if (!state.shuffle) return state.index + 1 < state.queue.length ? state.index + 1 : null;
  const position = state.shuffleOrder.indexOf(state.index);
  if (position < 0 || position + 1 >= state.shuffleOrder.length) return null;
  return state.shuffleOrder[position + 1] ?? null;
}

export function previousIndexIn(state: PlayerSessionState): number | null {
  if (state.queue.length === 0) return null;
  if (!state.shuffle) return state.index > 0 ? state.index - 1 : null;
  const position = state.shuffleOrder.indexOf(state.index);
  if (position <= 0) return null;
  return state.shuffleOrder[position - 1] ?? null;
}
