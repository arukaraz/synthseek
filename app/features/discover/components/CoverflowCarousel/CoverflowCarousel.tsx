"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { staggerItem } from "@utils/animations";
import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CoverflowCard } from "./CoverflowCard";
import { CoverflowSkeleton } from "./CoverflowSkeleton";
import { calculateAllTransforms, COVERFLOW_CONFIG, getCircularOffset } from "./utils/transforms";

interface TrendingTrackItem {
  track: SpotifyApi.TrackObjectFull;
  addedAt: string;
}

interface CoverflowCarouselProps {
  tracks: TrendingTrackItem[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onIndexChange: (index: number) => void;
  setIsAutoPlaying: (value: boolean) => void;
  isLoading: boolean;
  isError: boolean;
}

const NAV_BUTTON_CLASSES = cn(
  "absolute top-1/2 z-20 -translate-y-1/2",
  "bg-surface/80 hover:bg-surface flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm sm:h-12 sm:w-12",
  "border-fg/10 border shadow-lg"
);

export function CoverflowCarousel({
  tracks,
  currentIndex,
  onPrev,
  onNext,
  onIndexChange,
  setIsAutoPlaying,
  isLoading,
  isError,
}: CoverflowCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.offsetWidth);

    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transforms = useMemo(
    () => calculateAllTransforms(tracks.length, currentIndex, containerWidth),
    [tracks.length, currentIndex, containerWidth]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      }
    },
    [onPrev, onNext]
  );

  const showSkeleton = isLoading || containerWidth === 0 || tracks.length === 0;

  if (isError) {
    return (
      <motion.div variants={staggerItem} initial="hidden" animate="visible" className="p-8">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load trending tracks"
          description="Unable to fetch trending content from Spotify. Please try again later."
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      className="group/carousel relative w-full overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Trending tracks carousel"
    >
      {showSkeleton ? (
        <CoverflowSkeleton />
      ) : (
        <>
          <div className="w0-full relative mx-auto h-[80vw] sm:h-70 lg:h-[550px]" style={{ perspective: "100vw" }}>
            <div className="md:inherit hidden px-3 pt-15 sm:block">
              <h3 className="text-fg text-lg font-semibold">Random Trending Picks</h3>
              <p className="text-fg/60 text-xs">Fresh hits updated daily</p>
            </div>
            {tracks.map((trackItem, index) => {
              const offset = Math.abs(getCircularOffset(index, currentIndex, tracks.length));
              if (offset > COVERFLOW_CONFIG.maxVisible) return null;

              const transform = transforms[index];
              if (!transform) return null;

              return (
                <CoverflowCard
                  key={trackItem.track.id}
                  imageUrl={trackItem.track?.album?.images?.[0]?.url}
                  track={trackItem.track}
                  transform={transform}
                  isCenter={index === currentIndex}
                  index={index}
                  onClick={onIndexChange}
                  priority={offset <= 1}
                />
              );
            })}
          </div>

          <motion.button
            onClick={onPrev}
            className={cn(NAV_BUTTON_CLASSES, "left-2 sm:left-4 lg:left-6")}
            aria-label="Previous track"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "tween", duration: 0.15 }}
          >
            <ChevronLeft className="text-fg h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>

          <motion.button
            onClick={onNext}
            className={cn(NAV_BUTTON_CLASSES, "right-2 sm:right-4 lg:right-6")}
            aria-label="Next track"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "tween", duration: 0.15 }}
          >
            <ChevronRight className="text-fg h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
