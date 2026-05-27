"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { MAX_DOTS } from "./constants";
import { dotBase, dotsRow, navArrow, navContainer } from "./styles";
import type { TrendingHeroNavProps } from "./types";

export function TrendingHeroNav({ total, currentIndex, onSelect, onPrev, onNext }: TrendingHeroNavProps) {
  if (total <= 1) return null;

  const dotCount = Math.min(total, MAX_DOTS);
  const activeDot = Math.min(currentIndex, dotCount - 1);

  return (
    <div className={navContainer()}>
      <button type="button" onClick={onPrev} aria-label="Previous trending track" className={navArrow()}>
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className={dotsRow()}>
        {Array.from({ length: dotCount }).map((_, index) => {
          const isActive = index === activeDot;
          const realIndex = Math.round((index / Math.max(1, dotCount - 1)) * (total - 1));
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(realIndex)}
              aria-label={`Go to slide ${index + 1}`}
              className={dotBase({ active: isActive })}
            />
          );
        })}
      </div>

      <button type="button" onClick={onNext} aria-label="Next trending track" className={navArrow()}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
