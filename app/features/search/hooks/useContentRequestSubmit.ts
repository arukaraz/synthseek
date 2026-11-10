"use client";

import { useRef } from "react";

import { ContentType } from "@api/__generated__/types";
import { useBatchRequest, usePlaylistRequest, useRequest, useRequestTracks } from "@hooks/api";

import { getItemDisplayName, mapTrackFields } from "../components/ConfigRequestModal/helpers";
import type { ContentRequestSubmission, SubmitOutcome } from "./types";

export function useContentRequestSubmit() {
  const tracksNameRef = useRef("");
  const single = useRequest();
  const album = useBatchRequest();
  const playlist = usePlaylistRequest();
  const tracks = useRequestTracks(() => tracksNameRef.current);

  const isSubmitting = single.isPending || album.isPending || playlist.isPending || tracks.isPending;

  const submit = (submission: ContentRequestSubmission): SubmitOutcome => {
    const { item, mode, parentAlbum, config } = submission;
    const configField = config ? { config } : {};
    const destination = submission.destinationPathId ? { destinationPathId: submission.destinationPathId } : {};

    if (item.type === ContentType.enum.track) {
      single.mutate({
        track: mapTrackFields(item),
        album_external_id: parentAlbum?.id ?? item.album.id,
        ...configField,
        ...destination,
      });
      return "sent";
    }

    if (submission.tracks.length === 0) return "noTracks";

    if (mode === "artist-tracks") {
      tracksNameRef.current = getItemDisplayName(item);
      tracks.mutate({
        tracks: submission.tracks.map((track) => ({ track: mapTrackFields(track), album_external_id: track.album.id })),
        ...configField,
      });
      return "sent";
    }

    if (item.type === ContentType.enum.album) {
      album.mutate({
        external_id: item.id,
        name: item.name,
        credited_artist: item.artists[0]?.name || item.artist,
        album_art: item.images[0]?.url ?? null,
        total_tracks: item.total_tracks || submission.tracks.length,
        tracks: submission.tracks.map(mapTrackFields),
        ...configField,
        ...(submission.delegate ? { delegate: submission.delegate } : {}),
        ...destination,
      });
      return "sent";
    }

    if (item.type === ContentType.enum.playlist) {
      playlist.mutate({
        external_id: item.id,
        name: submission.playlistName?.trim() || item.name,
        description: item.description ?? null,
        owner: item.owner?.name ?? "Unknown",
        image: item.images?.[0]?.url ?? null,
        total_tracks: item.total_tracks || submission.tracks.length,
        tracks: submission.tracks.map((track) => ({
          ...mapTrackFields(track),
          album_external_id: track.album.id,
          album_name: track.album.name,
          album_artist: track.artists?.[0]?.name || track.artist || "Unknown Artist",
          album_image: track.album.images?.[0]?.url ?? null,
        })),
        ...configField,
      });
      return "sent";
    }

    return "noTracks";
  };

  return { submit, isSubmitting };
}
