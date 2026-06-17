"use client";

import { cn } from "@utils/cn";

import { GENRE_CHIPS_VISIBLE_DESKTOP, GENRE_CHIPS_VISIBLE_MOBILE } from "./constants";
import { genreOverflowChip } from "./styles";
import { genreChip, heroTags } from "../../styles";
import type { GenreChipsProps } from "./types";

export function GenreChips({ genres }: GenreChipsProps) {
  if (genres.length === 0) return null;

  const visible = genres.slice(0, GENRE_CHIPS_VISIBLE_DESKTOP);
  const mobileOverflow = genres.length - GENRE_CHIPS_VISIBLE_MOBILE;

  return (
    <div className={heroTags()}>
      {visible.map((genre, index) => (
        <span key={genre} className={cn(genreChip(), index >= GENRE_CHIPS_VISIBLE_MOBILE && "hidden sm:inline-flex")}>
          {genre}
        </span>
      ))}
      {mobileOverflow > 0 ? <span className={cn(genreOverflowChip(), "sm:hidden")}>+{mobileOverflow}</span> : null}
    </div>
  );
}
