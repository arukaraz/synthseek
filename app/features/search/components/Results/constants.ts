import { ContentType } from "@api/__generated__/types";
import type { FilterTab } from "./types";

export const FILTER_TABS: FilterTab[] = [
  { value: "all", labelKey: "results.filters.all" },
  { value: ContentType.enum.playlist, labelKey: "results.filters.playlist" },
  { value: ContentType.enum.artist, labelKey: "results.filters.artist" },
  { value: ContentType.enum.album, labelKey: "results.filters.album" },
  { value: ContentType.enum.track, labelKey: "results.filters.track" },
];
