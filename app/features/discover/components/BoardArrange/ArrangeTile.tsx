"use client";

import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { BOARD_TILE_ATTRIBUTE } from "@hooks/ui/board/constants";

import { BoardTileWidget } from "../ExploreBoard/BoardTileWidget";
import { BOARD_SIZE_NAME_KEYS } from "../ExploreBoard/constants";
import { runBoardKey, tileNameOf } from "../ExploreBoard/helpers";
import { tileSlot, tileSlotName, tileSlotSize, tileVars } from "../ExploreBoard/styles";
import { ScaledPreview } from "../WidgetGallery/ScaledPreview";
import { ArrangeTileBar } from "./ArrangeTileBar";
import { arrangeFrameOf, startsTileDrag } from "./helpers";
import { arrangeTile, arrangeTileBody } from "./styles";
import type { ArrangeTileProps } from "./types";

export function ArrangeTile({
  tile,
  device,
  boardWidth,
  metrics,
  layout,
  custom,
  customStatus,
  dragging,
  position,
  total,
  actions,
}: ArrangeTileProps) {
  const { t } = useTranslation("discover");
  const { item } = tile;
  const name = tileNameOf(item, custom, customStatus);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) runBoardKey(event, item, device, actions);
  };

  return (
    <div
      {...{ [BOARD_TILE_ATTRIBUTE]: item.id }}
      className={arrangeTile({ dragging })}
      style={tileVars(tile)}
      role="group"
      tabIndex={0}
      aria-label={t("board.tile.label", { name, position, total })}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => {
        if (startsTileDrag(event)) actions.startDrag(event, item.id);
      }}
    >
      {dragging ? (
        <div className={tileSlot()} aria-hidden>
          <span className={tileSlotName()}>{name}</span>
          <span className={tileSlotSize()}>{t(BOARD_SIZE_NAME_KEYS[tile.size])}</span>
        </div>
      ) : (
        <>
          <ArrangeTileBar item={item} device={device} name={name} position={position} total={total} actions={actions} />
          <div className={arrangeTileBody()}>
            <ScaledPreview frame={arrangeFrameOf(tile, device, boardWidth, metrics, layout)}>
              <BoardTileWidget item={item} size={tile.size} custom={custom} customStatus={customStatus} info={false} />
            </ScaledPreview>
          </div>
        </>
      )}
    </div>
  );
}
