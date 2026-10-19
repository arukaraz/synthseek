"use client";

import { useTranslation } from "react-i18next";

import { BOARD_WIDGETS } from "./constants";
import { boardTile, tileVars } from "./styles";
import type { BoardTileProps } from "./types";

export function BoardTile({ tile }: BoardTileProps) {
  const { t } = useTranslation("discover");
  const definition = BOARD_WIDGETS[tile.item.widget];
  const Widget = definition.component;

  return (
    <div className={boardTile()} style={tileVars(tile)} data-board-tile={tile.item.id}>
      <Widget size={tile.size} info={t(definition.descriptionKey)} />
    </div>
  );
}
