"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useTrendingTracks } from "@hooks/api/queries/useTrendingTracks";
import { staggerItem } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { errorFrame, heroFrame } from "./styles";
import { TrendingHeroNav } from "./TrendingHeroNav";
import { TrendingHeroSkeleton } from "./TrendingHeroSkeleton";
import { TrendingHeroSlide } from "./TrendingHeroSlide";

const AUTO_ROTATE_INTERVAL = 10000;

export function TrendingHero() {
  const { data, isLoading, isError } = useTrendingTracks();
  const tracks = useMemo(() => data?.data?.tracks ?? [], [data?.data?.tracks]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || tracks.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tracks.length);
    }, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isAutoPlaying, tracks.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [tracks.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  }, [tracks.length]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      }
    },
    [handlePrev, handleNext]
  );

  if (isError) {
    return (
      <div className={errorFrame()}>
        <EmptyState
          icon={AlertCircle}
          title="Failed to load trending tracks"
          description="Unable to fetch trending content. Please try again later."
        />
      </div>
    );
  }

  if (isLoading || tracks.length === 0) {
    return <TrendingHeroSkeleton />;
  }

  const active = tracks[currentIndex] ?? tracks[0];

  return (
    <motion.div
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      className={heroFrame()}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Trending tracks hero"
    >
      <TrendingHeroSlide
        item={active}
        currentIndex={currentIndex}
        total={tracks.length}
        onIndexChange={setCurrentIndex}
      />
      <TrendingHeroNav
        total={tracks.length}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </motion.div>
  );
}
