import type { LibraryPlaylistItem } from "@hooks/api/queries/library/types";

export function isEditablePlaylist(item: LibraryPlaylistItem): boolean {
  return item.source_provider == null || !item.sync_enabled;
}
