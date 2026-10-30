"use client";

import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { BOARD_TILE_ATTRIBUTE } from "@hooks/ui/board/constants";

import { CustomWidget } from "../CustomWidget/CustomWidget";
import { BoardTileEditControls } from "./BoardTileEditControls";
import { BOARD_SIZE_NAME_KEYS, BOARD_WIDGETS } from "./constants";
import { blockWidgetAction, boardKeyAction, cycleSize, editableSizesOf, tileNameOf } from "./helpers";
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
  const builtin = item.kind === "builtin" ? BOARD_WIDGETS[item.widget] : null;
  const Widget = builtin?.component;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!editing || event.target !== event.currentTarget) return;
    const action = boardKeyAction(event);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "remove") actions.remove(item.id);
    else if (action.kind === "move") actions.move(item.id, action.delta);
    else actions.resize(item.id, cycleSize(editableSizesOf(device), item.size, action.delta));
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
      <div className={tileBody({ editing, dragging })} onClickCapture={editing ? blockWidgetAction : undefined}>
        {builtin && Widget ? (
          <Widget size={tile.size} info={t(builtin.descriptionKey)} />
        ) : item.kind === "custom" ? (
          <CustomWidget widget={custom.get(item.widgetId) ?? null} status={customStatus} size={tile.size} />
        ) : null}
      </div>
      {dragging ? (
        <div className={tileSlot()} aria-hidden>
          <span className={tileSlotName()}>{name}</span>
          <span className={tileSlotSize()}>{t(BOARD_SIZE_NAME_KEYS[tile.size])}</span>
        </div>
      ) : null}
      {editing && !dragging ? (
        <BoardTileEditControls
          item={item}
          device={device}
          name={name}
          position={position}
          total={total}
          actions={actions}
        />
      ) : null}
    </div>
  );
}
