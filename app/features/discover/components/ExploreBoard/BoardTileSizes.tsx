"use client";

import { useTranslation } from "react-i18next";

import { BOARD_SIZE_LABEL_KEYS, BOARD_SIZE_NAME_KEYS } from "./constants";
import { editableSizesOf } from "./helpers";
import { sizeChip, sizeGroup } from "./styles";
import type { BoardTileSizesProps } from "./types";

export function BoardTileSizes({ item, device, name, dense = false, onResize }: BoardTileSizesProps) {
  const { t } = useTranslation("discover");
  const sizes = editableSizesOf(device);

  if (sizes.length < 2) return null;

  return (
    <div role="group" aria-label={t("board.tile.sizes", { name })} className={sizeGroup()}>
      {sizes.map((size) => (
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
