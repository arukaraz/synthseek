"use client";

import { Move, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BoardTileSizes } from "../ExploreBoard/BoardTileSizes";
import { TileSettingsMenu } from "../ExploreBoard/TileSettingsMenu";
import { arrangeBar, arrangeButton, arrangeHandle, arrangeName, arrangeTools } from "./styles";
import type { ArrangeTileBarProps } from "./types";

export function ArrangeTileBar({ item, device, name, position, total, actions }: ArrangeTileBarProps) {
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
        <Move className="size-3.5" />
      </button>
      <span className={arrangeName()}>{name}</span>
      <div className={arrangeTools()}>
        <BoardTileSizes item={item} device={device} name={name} dense onResize={actions.resize} />
        <TileSettingsMenu
          item={item}
          device={device}
          name={name}
          position={position}
          total={total}
          dense
          actions={actions}
        />
      </div>
      <button
        type="button"
        className={arrangeButton()}
        aria-label={t("board.tile.remove", { name })}
        onClick={() => actions.remove(item.id)}
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
