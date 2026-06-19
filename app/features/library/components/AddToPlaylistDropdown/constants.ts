import { LIBRARY_BATCH_LIMIT } from "@hooks/api/queries/library/constants";
import type { LibraryPlaylistsInput } from "@hooks/api/queries/library/types";

export const EDITABLE_PLAYLISTS_INPUT: LibraryPlaylistsInput = {
  limit: LIBRARY_BATCH_LIMIT,
  offset: 0,
  sort: "recent",
  direction: "desc",
};
