"use client";

import type { PlayerTrack, PlayerTone } from "@components/Player";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { playerActions } from "@hooks/ui/player";
import { useCallback } from "react";

const TONES: readonly PlayerTone[] = ["primary", "secondary", "accent"];

function toneFor(item: LibraryTrackItem): PlayerTone {
  let hash = 0;
  for (let index = 0; index < item.album_id.length; index += 1) {
    hash = (hash * 31 + item.album_id.charCodeAt(index)) % 997;
  }
  return TONES[hash % TONES.length] ?? "primary";
}

function playerTrackFrom(item: LibraryTrackItem): PlayerTrack {
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

export function useLibraryPlayback(items: readonly LibraryTrackItem[]): {
  play: (trackId: string) => void;
} {
  const play = useCallback(
    (trackId: string) => {
      const playable = items.filter((item) => item.playable);
      const startIndex = playable.findIndex((item) => item.id === trackId);
      if (startIndex < 0) return;
      playerActions.playQueue(playable.map(playerTrackFrom), startIndex);
    },
    [items]
  );

  return { play };
}
