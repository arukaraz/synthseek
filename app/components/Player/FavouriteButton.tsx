"use client";

import { cn } from "@utils/cn";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { iconButton } from "./styles";
import type { PlayerFavouriteProps } from "./types";

export function FavouriteButton({ view, actions, className }: PlayerFavouriteProps) {
  const { t } = useTranslation("player");

  return (
    <button
      type="button"
      className={cn(iconButton({ tone: view.favorite ? "favorite" : "muted" }), className)}
      onClick={actions.toggleFavorite}
      aria-label={view.favorite ? t("controls.unfavorite") : t("controls.favorite")}
      aria-pressed={view.favorite}
    >
      <Heart className={cn("size-5 sm:size-4", view.favorite ? "fill-current" : undefined)} />
    </button>
  );
}
