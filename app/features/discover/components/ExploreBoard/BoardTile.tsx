"use client";

import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { BOARD_TILE_ATTRIBUTE } from "@hooks/ui/board/constants";

import { BoardTileEditControls } from "./BoardTileEditControls";
import { BoardTileWidget } from "./BoardTileWidget";
import { BOARD_SIZE_NAME_KEYS } from "./constants";
import { blockWidgetAction, runBoardKey, tileNameOf } from "./helpers";
import { boardTile, tileBody, tileSlot, tileSlotName, tileSlotSize, tileVars } from "./styles";
import type { BoardTileProps } from "./types";

export function BoardTile({
  tile,
  device,
  custom,
  customStatus,
  editing,
  dragging,
  position,
  total,
  actions,
}: BoardTileProps) {
  const { t } = useTranslation("discover");
  const { item } = tile;
  const name = tileNameOf(item, custom, customStatus);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!editing || event.target !== event.currentTarget) return;
    runBoardKey(event, item, device, actions);
  };

  return (
    <div
      {...{ [BOARD_TILE_ATTRIBUTE]: item.id }}
      className={boardTile({ editing, dragging })}
      style={tileVars(tile)}
      role={editing ? "group" : undefined}
      tabIndex={editing ? 0 : undefined}
      aria-label={editing ? t("board.tile.label", { name, position, total }) : undefined}
      onKeyDown={handleKeyDown}
    >
      {editing && !dragging ? (
        <BoardTileEditControls
          item={item}
          device={device}
          name={name}
          editable={item.kind === "custom" && custom.has(item.widgetId)}
          position={position}
          total={total}
          actions={actions}
        />
      ) : null}
      <div className={tileBody({ editing, dragging })} onClickCapture={editing ? blockWidgetAction : undefined}>
        <BoardTileWidget item={item} size={tile.size} custom={custom} customStatus={customStatus} />
      </div>
      {dragging ? (
        <div className={tileSlot()} aria-hidden>
          <span className={tileSlotName()}>{name}</span>
          <span className={tileSlotSize()}>{t(BOARD_SIZE_NAME_KEYS[tile.size])}</span>
        </div>
      ) : null}
    </div>
  );
}
