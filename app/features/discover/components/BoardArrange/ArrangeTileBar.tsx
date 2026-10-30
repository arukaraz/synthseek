"use client";

import { GripVertical, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BoardTileSizes } from "../ExploreBoard/BoardTileSizes";
import { arrangeBar, arrangeButton, arrangeHandle, arrangeName } from "./styles";
import type { ArrangeTileBarProps } from "./types";

export function ArrangeTileBar({ item, device, name, showName, actions }: ArrangeTileBarProps) {
  const { t } = useTranslation("discover");

  return (
    <div className={arrangeBar()}>
      <button
        type="button"
        tabIndex={-1}
        className={arrangeHandle()}
        aria-label={t("board.tile.drag", { name })}
        onPointerDown={(event) => {
          event.stopPropagation();
          actions.startDrag(event, item.id);
        }}
      >
        <GripVertical className="size-3.5" />
      </button>
      {showName ? <span className={arrangeName()}>{name}</span> : null}
      <BoardTileSizes item={item} device={device} name={name} dense onResize={actions.resize} />
      <button
        type="button"
        className={arrangeButton({ end: !showName })}
        aria-label={t("board.tile.remove", { name })}
        onClick={() => actions.remove(item.id)}
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
