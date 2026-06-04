"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { staggerItem } from "@utils/animations";
import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NAV_BUTTON_CLASSES } from "../styles";
import { COVERFLOW_CONFIG } from "./constants";
import { CoverflowCard } from "./CoverflowCard";
import { CoverflowSkeleton } from "./CoverflowSkeleton";
import { calculateAllTransforms, getCircularOffset } from "./helpers";
import type { CoverflowCarouselProps } from "./types";

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
  const { t } = useTranslation("discover");
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
          title={t("coverflow.errorTitle")}
          description={t("coverflow.errorDescription")}
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
      aria-label={t("coverflow.regionAriaLabel")}
    >
      {showSkeleton ? (
        <CoverflowSkeleton />
      ) : (
        <>
          <div className="w0-full relative mx-auto h-[80vw] sm:h-70 lg:h-[550px]" style={{ perspective: "100vw" }}>
            <div className="md:inherit hidden px-3 pt-15 sm:block">
              <h3 className="text-fg text-lg font-semibold">{t("coverflow.title")}</h3>
              <p className="text-fg/60 text-xs">{t("coverflow.subtitle")}</p>
            </div>
            {tracks.map((trackItem, index) => {
              const offset = Math.abs(getCircularOffset(index, currentIndex, tracks.length));
              if (offset > COVERFLOW_CONFIG.maxVisible) return null;

              const transform = transforms[index];
              if (!transform) return null;

              return (
                <CoverflowCard
                  key={trackItem.track.id}
                  imageUrl={trackItem.track?.images?.[0]?.url}
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
            aria-label={t("coverflow.prevAriaLabel")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "tween", duration: 0.15 }}
          >
            <ChevronLeft className="text-fg h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>

          <motion.button
            onClick={onNext}
            className={cn(NAV_BUTTON_CLASSES, "right-2 sm:right-4 lg:right-6")}
            aria-label={t("coverflow.nextAriaLabel")}
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
