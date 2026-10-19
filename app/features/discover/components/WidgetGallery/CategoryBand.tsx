"use client";

import { useTranslation } from "react-i18next";

import { BOARD_CATEGORY_KEYS } from "../ExploreBoard/constants";
import { GALLERY_CATEGORY_ICONS } from "./constants";
import { band, bandCount, bandDescription, bandIcon, bandInner, bandText, bandTitle } from "./styles";
import type { CategoryBandProps } from "./types";

export function CategoryBand({ category, onBoard, total }: CategoryBandProps) {
  const { t } = useTranslation("discover");
  const Icon = GALLERY_CATEGORY_ICONS[category];
  const keys = BOARD_CATEGORY_KEYS[category];

  return (
    <div className={band()}>
      <div className={bandInner()}>
        <span className={bandIcon()}>
          <Icon className="size-3.5" />
        </span>
        <div className={bandText()}>
          <h3 className={bandTitle()}>{t(keys.title)}</h3>
          <p className={bandDescription()}>{t(keys.description)}</p>
        </div>
        <span className={bandCount()}>{t("board.gallery.categoryCount", { onBoard, total })}</span>
      </div>
    </div>
  );
}
