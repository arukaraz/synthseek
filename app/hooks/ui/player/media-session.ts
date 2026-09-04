import type { PlayerTrack } from "@components/Player";
import { artworkProxySrc } from "@utils/artworkProxy";

import { ARTWORK_SIZES } from "./constants";

interface MediaHandlers {
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
}

function session(): MediaSession | null {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return null;
  return navigator.mediaSession;
}

function artworkFor(track: PlayerTrack): MediaImage[] {
  if (track.artworkUrl === null) return [];
  const src = artworkProxySrc(track.artworkUrl);
  return ARTWORK_SIZES.map((sizes) => ({ src, sizes, type: "image/jpeg" }));
}

export function publishMediaSession(track: PlayerTrack, handlers: MediaHandlers): void {
  const media = session();
  if (media === null) return;

  media.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork: artworkFor(track),
  });

  register(media, "play", handlers.play);
  register(media, "pause", handlers.pause);
  register(media, "nexttrack", handlers.next);
  register(media, "previoustrack", handlers.previous);
  register(media, "seekto", (details) => {
    if (typeof details.seekTime === "number") handlers.seekTo(details.seekTime);
  });
}

function register(media: MediaSession, action: MediaSessionAction, handler: MediaSessionActionHandler): void {
  try {
    media.setActionHandler(action, handler);
  } catch {
    return;
  }
}

export function publishPlaybackState(playing: boolean): void {
  const media = session();
  if (media === null) return;
  media.playbackState = playing ? "playing" : "paused";
}

export function publishPosition(durationSeconds: number, positionSeconds: number, playing: boolean): void {
  const media = session();
  if (media === null || typeof media.setPositionState !== "function") return;
  if (durationSeconds <= 0 || positionSeconds > durationSeconds) return;
  try {
    media.setPositionState({
      duration: durationSeconds,
      position: Math.max(0, positionSeconds),
      playbackRate: playing ? 1 : 0,
    });
  } catch {
    return;
  }
}

export function clearMediaSession(): void {
  const media = session();
  if (media === null) return;
  media.metadata = null;
  media.playbackState = "none";
}
