import { LB_PLAYLIST_KINDS } from "./constants";
import type { LbPlaylistKind, LbPlaylistNamesDraft } from "./types";

export function playlistNamesDraft(names: Partial<Record<LbPlaylistKind, string>> | undefined): LbPlaylistNamesDraft {
  return {
    "cf-recommendations": names?.["cf-recommendations"] ?? "",
    "weekly-exploration": names?.["weekly-exploration"] ?? "",
    "weekly-jams": names?.["weekly-jams"] ?? "",
    "daily-jams": names?.["daily-jams"] ?? "",
  };
}

export function playlistNamesPatch(draft: LbPlaylistNamesDraft): Partial<Record<LbPlaylistKind, string>> {
  const patch: Partial<Record<LbPlaylistKind, string>> = {};
  for (const kind of LB_PLAYLIST_KINDS) {
    const value = draft[kind].trim();
    if (value) patch[kind] = value;
  }
  return patch;
}

export function playlistNamesDirty(
  draft: LbPlaylistNamesDraft,
  saved: Partial<Record<LbPlaylistKind, string>> | undefined
): boolean {
  for (const kind of LB_PLAYLIST_KINDS) {
    if (draft[kind].trim() !== (saved?.[kind] ?? "")) return true;
  }
  return false;
}
