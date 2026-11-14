"use client";

import { useTranslation } from "react-i18next";

import { BOARD_ROW_HEIGHT_KEYS, BOARD_ROW_HEIGHT_ORDER } from "./constants";
import { rowFrame, rowFrameHead, rowFrameLabel, rowFrameVars, sizeChip, sizeGroup } from "./styles";
import type { BoardRowFrameProps } from "./types";

export function BoardRowFrame({ row, onHeight }: BoardRowFrameProps) {
  const { t } = useTranslation("discover");

  return (
    <div className={rowFrame()} style={rowFrameVars(row)} data-cy="board-row-frame">
      <div className={rowFrameHead()}>
        <span className={rowFrameLabel()}>{t("board.row.label", { position: row.position })}</span>
        {row.sizable ? (
          <div role="group" aria-label={t("board.row.height", { position: row.position })} className={sizeGroup()}>
            {BOARD_ROW_HEIGHT_ORDER.map((height) => (
              <button
                key={height}
                type="button"
                aria-pressed={height === row.height}
                className={sizeChip({ active: height === row.height })}
                onClick={() => onHeight(row, height)}
              >
                {t(BOARD_ROW_HEIGHT_KEYS[height])}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
