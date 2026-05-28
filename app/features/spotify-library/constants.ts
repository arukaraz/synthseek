import { Album, Disc, Heart, Layers, ListMusic } from "lucide-react";

import type { FilterSortFilterOption, FilterSortSortOption } from "@components/ui/FilterSortDropdown";

import type { LibraryFilter, LibrarySort } from "./types";

export const FILTER_OPTIONS: ReadonlyArray<FilterSortFilterOption<LibraryFilter>> = [
  { value: "all", label: "All", icon: Layers },
  { value: "playlists", label: "Playlists", icon: ListMusic },
  { value: "albums", label: "Albums", icon: Disc },
  { value: "liked", label: "Liked", icon: Heart },
];

export const SORT_OPTIONS: ReadonlyArray<FilterSortSortOption<LibrarySort>> = [
  { value: "name", label: "Name" },
  { value: "type", label: "Type" },
  { value: "tracks", label: "Tracks" },
  { value: "imported", label: "Imported status" },
  { value: "lastSync", label: "Last sync" },
  { value: "syncStatus", label: "Sync status" },
];

export { Album };

export const DEFAULT_IMPORT_CONFIG = {
  bitrate: { value: 320, matching: "flexible" as const },
  format: { value: "mp3" as const, matching: "flexible" as const },
};

export const TRACK_PREVIEW_LIMIT = 5;
