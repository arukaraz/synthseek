"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, GripVertical, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BOARD_SIZE_LABEL_KEYS, BOARD_SIZE_NAME_KEYS } from "./constants";
import { editableSizesOf } from "./helpers";
import { controlButton, dragHandle, editControls, sizeChip, sizeGroup } from "./styles";
import type { BoardTileEditControlsProps } from "./types";

export function BoardTileEditControls({ item, device, name, position, total, actions }: BoardTileEditControlsProps) {
  const { t } = useTranslation("discover");
  const sizes = editableSizesOf(item, device);
  const EarlierIcon = device === "wide" ? ArrowLeft : ArrowUp;
  const LaterIcon = device === "wide" ? ArrowRight : ArrowDown;

  return (
    <div className={editControls()}>
      {sizes.length > 1 ? (
        <div role="group" aria-label={t("board.tile.sizes", { name })} className={sizeGroup()}>
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={size === item.size}
              aria-label={t(BOARD_SIZE_NAME_KEYS[size])}
              className={sizeChip({ active: size === item.size })}
              onClick={() => actions.resize(item.id, size)}
            >
              {t(BOARD_SIZE_LABEL_KEYS[size])}
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        className={controlButton()}
        aria-label={t("board.tile.moveEarlier", { name })}
        disabled={position <= 1}
        onClick={() => actions.move(item.id, -1)}
      >
        <EarlierIcon className="size-4" />
      </button>
      <button
        type="button"
        className={controlButton()}
        aria-label={t("board.tile.moveLater", { name })}
        disabled={position >= total}
        onClick={() => actions.move(item.id, 1)}
      >
        <LaterIcon className="size-4" />
      </button>
      <button
        type="button"
        className={controlButton({ tone: "danger" })}
        aria-label={t("board.tile.remove", { name })}
        onClick={() => actions.remove(item.id)}
      >
        <X className="size-4" />
      </button>
      <button
        type="button"
        tabIndex={-1}
        className={dragHandle()}
        aria-label={t("board.tile.drag", { name })}
        onPointerDown={(event) => actions.startDrag(event, item.id)}
      >
        <GripVertical className="size-4" />
      </button>
    </div>
  );
}
