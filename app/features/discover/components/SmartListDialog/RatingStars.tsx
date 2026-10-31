"use client";

import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { STAR_VALUES } from "./constants";
import { star, stars } from "./styles";
import type { RatingStarsProps } from "./types";

export function RatingStars({ label, rating, onChange }: RatingStarsProps) {
  const { t } = useTranslation("discover");

  return (
    <span className={stars()} role="group" aria-label={label}>
      {STAR_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={rating === value}
          aria-label={t("smartList.rate", { count: value })}
          className={star({ lit: (rating ?? 0) >= value })}
          onClick={() => onChange(rating === value ? null : value)}
        >
          <Star aria-hidden />
        </button>
      ))}
    </span>
  );
}
