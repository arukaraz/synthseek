import i18n from "@locale";
import { z } from "zod";

import { COVER_ERROR_FALLBACK_KEY, COVER_ERROR_KEYS } from "./constants";
import type { RemovedPlaylistTrack, SuggestedTrackToAdd } from "./types";

const CoverErrorCodeSchema = z.enum(["PLAYLIST_COVER_UNSUPPORTED", "PLAYLIST_COVER_TOO_LARGE"]);

const CoverFailureSchema = z.object({ error: z.string() });

export function coverErrorKey(code: string | null) {
  const known = CoverErrorCodeSchema.safeParse(code);
  return known.success ? COVER_ERROR_KEYS[known.data] : COVER_ERROR_FALLBACK_KEY;
}

export async function coverUploadFailure(response: Response): Promise<string | null> {
  if (response.status === 413) return CoverErrorCodeSchema.enum.PLAYLIST_COVER_TOO_LARGE;
  try {
    const parsed = CoverFailureSchema.safeParse(await response.json());
    return parsed.success ? parsed.data.error : null;
  } catch {
    return null;
  }
}

export function suggestedTrackRequest(track: SuggestedTrackToAdd) {
  return {
    track: {
      external_id: track.externalId,
      title: track.title,
      credited_artist: track.artist,
      track_number: track.trackNumber,
      disc_number: 1,
      duration_ms: track.durationMs,
      explicit: false,
      isrc: track.isrc,
    },
    album_external_id: track.album?.externalId ?? "",
  };
}

export function removedTracksMessage(removed: readonly RemovedPlaylistTrack[], skipped: boolean): string {
  const only = removed.length === 1 ? removed[0] : undefined;
  if (only === undefined) return i18n.t("mutations:playlists.tracksRemovedCount", { count: removed.length });
  return skipped
    ? i18n.t("mutations:playlists.trackRemovedAndSkipped", { title: only.title })
    : i18n.t("mutations:playlists.trackRemoved", { title: only.title });
}
