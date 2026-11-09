"use client";

import { useTranslation } from "react-i18next";

import { LockedAction } from "../WidgetGallery/LockedAction";
import { BOARD_SIZE_LABEL_KEYS, BOARD_SIZE_NAME_KEYS, BOARD_SIZE_ORDER } from "./constants";
import { allowedSizesOf } from "./helpers";
import { sizeChip, sizeGroup } from "./styles";
import type { BoardTileSizesProps } from "./types";

export function BoardTileSizes({ item, name, custom, dense = false, onResize }: BoardTileSizesProps) {
  const { t } = useTranslation("discover");
  const allowed = allowedSizesOf(item, custom);
  const only = allowed.length === 1 ? allowed[0] : undefined;

  return (
    <div role="group" aria-label={t("board.tile.sizes", { name })} className={sizeGroup()}>
      {BOARD_SIZE_ORDER.map((size) =>
        only !== undefined && size !== only ? (
          <LockedAction
            key={size}
            label={t(BOARD_SIZE_NAME_KEYS[size])}
            hint={t("board.tile.sizeLocked", { name, size: t(BOARD_SIZE_NAME_KEYS[only]) })}
          >
            <span className={sizeChip({ active: "locked", dense })} aria-hidden>
              {t(BOARD_SIZE_LABEL_KEYS[size])}
            </span>
          </LockedAction>
        ) : (
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
        )
      )}
    </div>
  );
}
