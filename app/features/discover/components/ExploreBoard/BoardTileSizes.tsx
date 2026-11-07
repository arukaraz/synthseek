"use client";

import { useTranslation } from "react-i18next";

import { BOARD_SIZE_LABEL_KEYS, BOARD_SIZE_NAME_KEYS, BOARD_SIZE_ORDER } from "./constants";
import { sizeChip, sizeGroup } from "./styles";
import type { BoardTileSizesProps } from "./types";

export function BoardTileSizes({ item, name, dense = false, onResize }: BoardTileSizesProps) {
  const { t } = useTranslation("discover");

  return (
    <div role="group" aria-label={t("board.tile.sizes", { name })} className={sizeGroup()}>
      {BOARD_SIZE_ORDER.map((size) => (
        <button
          key={size}
          type="button"
          aria-pressed={size === item.size}
          aria-label={t(BOARD_SIZE_NAME_KEYS[size])}
          className={sizeChip({ active: size === item.size, dense })}
          onClick={() => onResize(item.id, size)}
        >
          {t(BOARD_SIZE_LABEL_KEYS[size])}
        </button>
      ))}
    </div>
  );
}
