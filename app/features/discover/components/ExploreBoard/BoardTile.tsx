"use client";

import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { BOARD_TILE_ATTRIBUTE } from "@hooks/ui/board/constants";

import { BoardTileEditControls } from "./BoardTileEditControls";
import { BOARD_SIZE_NAME_KEYS, BOARD_WIDGETS } from "./constants";
import { blockWidgetAction, boardKeyAction, cycleSize, sizesOf } from "./helpers";
import { boardTile, tileBody, tileSlot, tileSlotName, tileSlotSize, tileVars } from "./styles";
import type { BoardTileProps } from "./types";

export function BoardTile({ tile, device, editing, dragging, position, total, actions }: BoardTileProps) {
  const { t } = useTranslation("discover");
  const { item } = tile;
  const definition = BOARD_WIDGETS[item.widget];
  const Widget = definition.component;
  const name = t(definition.titleKey);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!editing || event.target !== event.currentTarget) return;
    const action = boardKeyAction(event);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "remove") actions.remove(item.id);
    else if (action.kind === "move") actions.move(item.id, action.delta);
    else actions.resize(item.id, cycleSize(sizesOf(definition), item.size, action.delta));
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
        <Widget size={tile.size} info={t(definition.descriptionKey)} />
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
