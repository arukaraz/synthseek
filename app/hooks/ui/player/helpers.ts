import type { PlayerScrobbleState, PlayerTone, PlayerTrack } from "@components/Player";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

import {
  CONVERTED_BITRATE_KBPS,
  CONVERTED_FORMAT,
  DEVICE_HEARTBEAT_MS,
  LISTEN_DELTA_CEILING_SECONDS,
  LISTEN_FRACTION,
  LISTEN_MAX_SECONDS,
  PLAYBACK_MIME_BY_FORMAT,
  SESSION_POSITION_DRIFT_MS,
  TONES,
} from "./constants";
import type { PlaybackTrackSummary } from "@api/__generated__/types";

import type {
  ListenProgress,
  ListeningConnectionStatus,
  PlayerSessionState,
  RemotePlayback,
  SessionSnapshot,
} from "./types";

export function toneFor(seed: string): PlayerTone {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 997;
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
    tone: toneFor(item.album_id),
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

export function queueChanged(previous: SessionSnapshot | null, next: SessionSnapshot): boolean {
  if (previous === null) return true;
  if (previous.currentTrackId !== next.currentTrackId) return true;
  if (previous.trackIds.length !== next.trackIds.length) return true;
  return previous.trackIds.some((id, index) => id !== next.trackIds[index]);
}

export function sessionChanged(previous: SessionSnapshot | null, next: SessionSnapshot): boolean {
  if (queueChanged(previous, next)) return true;
  return Math.abs((previous?.positionMs ?? 0) - next.positionMs) >= SESSION_POSITION_DRIFT_MS;
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

export function trackSummary(session: PlayerSessionState): PlaybackTrackSummary | null {
  const current = session.queue[session.index] ?? null;
  if (current === null) return null;
  return {
    id: current.id,
    title: current.title,
    artist: current.artist,
    album: current.album,
    durationSeconds: session.durationSeconds > 0 ? Math.round(session.durationSeconds) : current.durationSeconds,
    format: current.format,
    bitrateKbps: current.bitrateKbps,
    lossless: current.lossless,
    artworkUrl: current.artworkUrl,
  };
}

export function isMirroring(session: PlayerSessionState): boolean {
  return session.remote !== null && !session.playing;
}

export function beginListen(trackId: string, startedAt: number, positionSeconds: number): ListenProgress {
  return { trackId, startedAt, listenedSeconds: 0, lastPositionSeconds: positionSeconds, recorded: false };
}

export function accumulateListen(progress: ListenProgress, positionSeconds: number): ListenProgress {
  const delta = positionSeconds - progress.lastPositionSeconds;
  const heard = delta > 0 && delta <= LISTEN_DELTA_CEILING_SECONDS ? delta : 0;
  return { ...progress, listenedSeconds: progress.listenedSeconds + heard, lastPositionSeconds: positionSeconds };
}

export function listenThresholdSeconds(durationSeconds: number): number {
  return Math.min(durationSeconds * LISTEN_FRACTION, LISTEN_MAX_SECONDS);
}

export function listenIsDue(progress: ListenProgress, durationSeconds: number): boolean {
  if (progress.recorded || durationSeconds <= 0) return false;
  return progress.listenedSeconds >= listenThresholdSeconds(durationSeconds);
}

export function listenRestarted(progress: ListenProgress, positionSeconds: number): boolean {
  if (!progress.recorded) return false;
  return positionSeconds + LISTEN_DELTA_CEILING_SECONDS < progress.lastPositionSeconds;
}

export function startedSecondsAgo(progress: ListenProgress, now: number): number {
  return Math.max(0, Math.round((now - progress.startedAt) / 1000));
}

export function scrobbleStateFrom(connections: readonly ListeningConnectionStatus[]): PlayerScrobbleState {
  const sending = connections.filter((connection) => connection.connected && connection.scrobbleEnabled);
  if (sending.length === 0) return "off";
  if (
    sending.some((connection) => connection.lastFailure === "unauthorized" || connection.lastFailure === "rejected")
  ) {
    return "failed";
  }
  if (sending.some((connection) => connection.lastFailure === "unavailable")) return "retrying";
  return "sending";
}
