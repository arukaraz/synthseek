"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useTrendingTracks } from "@hooks/api/queries/useTrendingTracks";
import { useSwipe } from "@hooks/ui/useSwipe";
import { staggerItem } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AUTO_ROTATE_INTERVAL } from "./constants";
import { errorFrame, heroFrame } from "./styles";
import { TrendingHeroNav } from "./TrendingHeroNav";
import { TrendingHeroSkeleton } from "./TrendingHeroSkeleton";
import { TrendingHeroSlide } from "./TrendingHeroSlide";

export function TrendingHero() {
  const { t } = useTranslation("discover");
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

  const swipeHandlers = useSwipe({ onSwipeLeft: handleNext, onSwipeRight: handlePrev });

  if (isError) {
    return (
      <div className={errorFrame()}>
        <EmptyState
          icon={AlertCircle}
          title={t("trendingHero.errorTitle")}
          description={t("trendingHero.errorDescription")}
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
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
      tabIndex={0}
      role="region"
      aria-label={t("trendingHero.regionAriaLabel")}
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
