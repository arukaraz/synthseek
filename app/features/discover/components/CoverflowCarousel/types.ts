import type { MusicTrack } from "@api/__generated__/types";

export interface CardTransform {
  translateX: number;
  rotateY: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

export interface TrendingTrackItem {
  track: MusicTrack;
  addedAt: string;
}

export interface CoverflowCarouselProps {
  tracks: TrendingTrackItem[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onIndexChange: (index: number) => void;
  setIsAutoPlaying: (value: boolean) => void;
  isLoading: boolean;
  isError: boolean;
}

export interface CoverflowCardProps {
  imageUrl: string | null | undefined;
  track: MusicTrack;
  transform: CardTransform;
  isCenter: boolean;
  index: number;
  onClick: (index: number) => void;
  priority?: boolean;
}
