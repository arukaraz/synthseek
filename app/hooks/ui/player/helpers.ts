import type { PlayerQueueEntry, PlayerScrobbleState, PlayerTone, PlayerTrack } from "@components/Player";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

import {
  AUTOPLAY_REFILL_BELOW,
  AUTOPLAY_SEED_LIMIT,
  DEVICE_HEARTBEAT_MS,
  LISTEN_DELTA_CEILING_SECONDS,
  LISTEN_FRACTION,
  LISTEN_MAX_SECONDS,
  MAX_QUEUE_TRACKS,
  PLAYBACK_MIME_BY_FORMAT,
  SESSION_POSITION_DRIFT_MS,
  TONES,
} from "./constants";
import type { PlaybackTrackSummary } from "@api/__generated__/types";

import type {
  ListenProgress,
  ListeningConnectionStatus,
  PlayerSessionState,
  QueueAddOutcome,
  RemotePlayback,
  SessionSnapshot,
  StreamConversion,
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
    albumId: item.album_id,
    durationSeconds: Math.round(item.duration_ms / 1000),
    format,
    bitrateKbps: item.file_bitrate ?? item.bitrate,
    lossless: format === "flac" || format === "wav" || format === "alac",
    tone: toneFor(item.album_id),
    artworkUrl: item.albumArt,
    replayGain: item.replayGain,
  };
}

export function streamUrlFor(trackId: string, conversion: StreamConversion | null, offsetSeconds: number): string {
  const base = `/api/v1/library/tracks/${encodeURIComponent(trackId)}/stream`;
  if (conversion === null) return base;
  const query = new URLSearchParams({ format: conversion.format, maxBitrate: String(conversion.bitrateKbps) });
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

export function upcomingOrder(state: PlayerSessionState): number[] {
  if (state.queue.length === 0) return [];
  if (!state.shuffle) {
    return Array.from({ length: state.queue.length - state.index - 1 }, (_, step) => state.index + step + 1);
  }
  const position = state.shuffleOrder.indexOf(state.index);
  if (position < 0) return [];
  return state.shuffleOrder.slice(position + 1);
}

export function withoutQueueIndex(order: readonly number[], removed: number): number[] {
  return order.filter((index) => index !== removed).map((index) => (index > removed ? index - 1 : index));
}

export function visibleQueueIds(state: PlayerSessionState): Set<string> {
  const ids = new Set<string>();
  const current = state.queue[state.index];
  if (current !== undefined) ids.add(current.id);
  for (const index of upcomingOrder(state)) {
    const track = state.queue[index];
    if (track !== undefined) ids.add(track.id);
  }
  return ids;
}

export function withoutQueuePositions(
  state: PlayerSessionState,
  removed: readonly number[]
): { queue: PlayerTrack[]; index: number; shuffleOrder: number[] } {
  const dropped = new Set(removed);
  const queue = state.queue.filter((_, at) => !dropped.has(at));
  let index = state.index;
  let shuffleOrder = [...state.shuffleOrder];
  for (const at of [...dropped].sort((a, b) => b - a)) {
    shuffleOrder = withoutQueueIndex(shuffleOrder, at);
    if (at < index) index -= 1;
  }
  return { queue, index, shuffleOrder };
}

export function resolveQueueAdditions(
  state: PlayerSessionState,
  tracks: readonly PlayerTrack[]
): { fresh: PlayerTrack[]; relocated: number[]; outcome: QueueAddOutcome } {
  const visible = visibleQueueIds(state);
  const seen = new Set<string>();
  const wanted: PlayerTrack[] = [];
  for (const track of tracks) {
    if (visible.has(track.id) || seen.has(track.id)) continue;
    seen.add(track.id);
    wanted.push(track);
  }

  const relocated: number[] = [];
  const fresh: PlayerTrack[] = [];
  let length = state.queue.length;
  for (const track of wanted) {
    const at = state.queue.findIndex((queued) => queued.id === track.id);
    if (at < 0 && length >= MAX_QUEUE_TRACKS) continue;
    if (at < 0) length += 1;
    else relocated.push(at);
    fresh.push(track);
  }

  return {
    fresh,
    relocated,
    outcome: { added: fresh.length, full: fresh.length < wanted.length, skipped: tracks.length - fresh.length },
  };
}

export function queueSections(state: PlayerSessionState): {
  upNext: PlayerQueueEntry[];
  autoplay: PlayerQueueEntry[];
} {
  const upNext: PlayerQueueEntry[] = [];
  const autoplay: PlayerQueueEntry[] = [];
  for (const index of upcomingOrder(state)) {
    const track = state.queue[index];
    if (track === undefined) continue;
    (state.autoplayIds.has(track.id) ? autoplay : upNext).push({ index, track });
  }
  return { upNext, autoplay };
}

export function autoplayDue(state: PlayerSessionState): boolean {
  if (!state.autoplay || !state.playing || state.remote !== null || state.repeat !== "off") return false;
  if (state.queue.length >= MAX_QUEUE_TRACKS) return false;
  return upcomingOrder(state).length < AUTOPLAY_REFILL_BELOW;
}

export function autoplaySignature(state: PlayerSessionState): string {
  return `${state.queue[state.index]?.id ?? ""}:${state.queue.length}`;
}

export function autoplaySeeds(state: PlayerSessionState, random: () => number): string[] {
  const current = state.queue[state.index];
  if (current === undefined) return [];
  const chosen = state.queue.filter((track) => track.id !== current.id && !state.autoplayIds.has(track.id));
  const pool = (chosen.length > 0 ? chosen : state.queue.filter((track) => track.id !== current.id)).map(
    (track) => track.id
  );
  const picked: string[] = [];
  while (picked.length < AUTOPLAY_SEED_LIMIT - 1 && pool.length > 0) {
    const at = Math.floor(random() * pool.length);
    picked.push(...pool.splice(at, 1));
  }
  return [current.id, ...picked];
}

export function insertBeforeAutoplay(
  state: PlayerSessionState,
  tracks: readonly PlayerTrack[]
): { queue: PlayerTrack[]; shuffleOrder: number[] } {
  const firstAutoplay = state.queue.findIndex((track, at) => at > state.index && state.autoplayIds.has(track.id));
  const at = firstAutoplay < 0 ? state.queue.length : firstAutoplay;
  const queue = [...state.queue.slice(0, at), ...tracks, ...state.queue.slice(at)];
  const fresh = tracks.map((_, offset) => at + offset);
  const shifted = state.shuffleOrder.map((index) => (index >= at ? index + tracks.length : index));
  const before = shifted.findIndex(
    (index) => index >= at + tracks.length && state.autoplayIds.has(queue[index]?.id ?? "")
  );
  const shuffleOrder =
    before < 0 ? [...shifted, ...fresh] : [...shifted.slice(0, before), ...fresh, ...shifted.slice(before)];
  return { queue, shuffleOrder };
}

export function autoplayIdsAmong(tracks: readonly PlayerTrack[], autoplayTrackIds: readonly string[]): Set<string> {
  const wanted = new Set(autoplayTrackIds);
  return new Set(tracks.filter((track) => wanted.has(track.id)).map((track) => track.id));
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

export function withoutRepeats(
  tracks: readonly PlayerTrack[],
  against: readonly PlayerTrack[],
  room: number
): PlayerTrack[] {
  const seen = new Set(against.map((track) => track.id));
  const kept: PlayerTrack[] = [];
  for (const track of tracks) {
    if (kept.length >= room) break;
    if (seen.has(track.id)) continue;
    seen.add(track.id);
    kept.push(track);
  }
  return kept;
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
