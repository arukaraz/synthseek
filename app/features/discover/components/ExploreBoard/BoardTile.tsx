"use client";

import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { BOARD_TILE_ATTRIBUTE } from "@hooks/ui/board/constants";

import { BoardTileEditControls } from "./BoardTileEditControls";
import { BOARD_WIDGETS } from "./constants";
import { boardKeyAction, cycleSize } from "./helpers";
import { boardTile, tileBody, tileVars } from "./styles";
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
    else actions.resize(item.id, cycleSize(definition.sizes, item.size, action.delta));
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
      <div className={tileBody({ editing })} inert={editing}>
        <Widget size={tile.size} info={t(definition.descriptionKey)} />
      </div>
      {editing ? (
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
