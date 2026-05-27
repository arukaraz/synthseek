import type { MusicTrack } from "@api/__generated__/types";

export interface TrendingHeroNavProps {
  total: number;
  currentIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export interface TrendingHeroSlideProps {
  item: { track: MusicTrack; addedAt: string };
  currentIndex: number;
  total: number;
  onIndexChange: (index: number) => void;
}
