import type { MusicTrack } from "@api/__generated__/types";
import type { BoardSize } from "@hooks/api/queries/board/types";

export interface TrendingEntry {
  track: MusicTrack;
  addedAt: string;
}

export interface TrendingHeroProps {
  size: BoardSize;
  info: string;
}

export interface TrendingListProps {
  entries: readonly TrendingEntry[];
  info: string;
  loading: boolean;
  failed: boolean;
}

export interface TrendingHeroNavProps {
  total: number;
  currentIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export interface TrendingHeroSlideProps {
  item: TrendingEntry;
  currentIndex: number;
  total: number;
  onIndexChange: (index: number) => void;
  onRequestOpenChange: (open: boolean) => void;
  info: string;
}
