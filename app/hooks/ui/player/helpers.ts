import type { PlayerTone, PlayerTrack } from "@components/Player";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

import {
  CONVERTED_BITRATE_KBPS,
  CONVERTED_FORMAT,
  DEVICE_HEARTBEAT_MS,
  PLAYBACK_MIME_BY_FORMAT,
  SESSION_POSITION_DRIFT_MS,
  TONES,
} from "./constants";
import type { PlayerSessionState, RemotePlayback, SessionSnapshot } from "./types";

function toneFor(item: LibraryTrackItem): PlayerTone {
  let hash = 0;
  for (let index = 0; index < item.album_id.length; index += 1) {
    hash = (hash * 31 + item.album_id.charCodeAt(index)) % 997;
  }
  return TONES[hash % TONES.length] ?? "primary";
}

export function playerTrackFrom(item: LibraryTrackItem): PlayerTrack {
  const format = item.file_format ?? item.format;
  return {
    id: item.id,
    title: item.title,
    artist: item.artist,
    album: item.albumName,
    durationSeconds: Math.round(item.duration_ms / 1000),
    format,
    bitrateKbps: item.file_bitrate ?? item.bitrate,
    lossless: format === "flac" || format === "wav" || format === "alac",
    tone: toneFor(item),
    artworkUrl: item.albumArt,
  };
}

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

export function sessionChanged(previous: SessionSnapshot | null, next: SessionSnapshot): boolean {
  if (previous === null) return true;
  if (previous.currentTrackId !== next.currentTrackId) return true;
  if (previous.trackIds.length !== next.trackIds.length) return true;
  if (previous.trackIds.some((id, index) => id !== next.trackIds[index])) return true;
  return Math.abs(previous.positionMs - next.positionMs) >= SESSION_POSITION_DRIFT_MS;
}

export function beatIsDue(lastBeatAt: number, now: number): boolean {
  return now - lastBeatAt >= DEVICE_HEARTBEAT_MS;
}

export function mirroredPositionSeconds(remote: RemotePlayback, now: number): number {
  if (!remote.playing) return remote.positionSeconds;
  return remote.positionSeconds + Math.max(0, (now - remote.updatedAt) / 1000);
}

export function expectedPosition(
  previous: { playing: boolean; positionSeconds: number; at: number },
  now: number
): number {
  if (!previous.playing) return previous.positionSeconds;
  return previous.positionSeconds + Math.max(0, (now - previous.at) / 1000);
}
