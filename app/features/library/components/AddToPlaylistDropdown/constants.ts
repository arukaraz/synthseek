import type { LibraryPlaylistsQuery } from "@hooks/api/queries/library/types";

export const EDITABLE_PLAYLISTS_INPUT: LibraryPlaylistsQuery = {
  sort: "recent",
  direction: "desc",
};
