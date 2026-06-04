import type { ContentType, MusicItem } from "@api/__generated__/types";
import type { ParseKeys } from "i18next";

export type FilterType = ContentType | "all";

export interface FilterTab {
  value: FilterType;
  labelKey: ParseKeys<"search">;
}

export interface Result {
  id: string;
  type: ContentType;
  name: string;
  artist: string;
  album?: string;
  image?: string;
  year?: string;
  trackCount?: number;
}

export interface CardProps {
  result: Result;
  onResultClick: (resultId: string, type: ContentType) => void;
}

export interface ResultsProps {
  results: MusicItem[];
  onResultClick: (resultId: string, type: ContentType) => void;
}

export interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  availableTypes?: Set<string>;
}

export interface AllResultsProps {
  title: string;
  results: MusicItem[];
  totalCount: number;
  maxDisplay: number;
  onSeeAll: () => void;
  filterType: ContentType;
  onResultClick: (resultId: string, type: ContentType) => void;
}

export interface SkeletonGridProps {
  count?: number;
}
