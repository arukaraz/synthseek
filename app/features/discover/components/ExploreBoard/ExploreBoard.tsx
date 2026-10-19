"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { SectionLoading } from "@components/ui/SectionLoading";
import { useBoardLayout } from "@hooks/api/queries/board/useBoardLayout";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";

import { BoardTile } from "./BoardTile";
import { BOARD_WIDE_QUERY } from "./constants";
import { boardItemsOf, packBoard } from "./helpers";
import { boardGrid, boardGridVars, boardRoot } from "./styles";

export function ExploreBoard() {
  const { t } = useTranslation("discover");
  const device = useMediaQuery(BOARD_WIDE_QUERY, true) ? "wide" : "narrow";
  const { data, isLoading } = useBoardLayout();
  const items = useMemo(() => boardItemsOf(data), [data]);
  const tiles = useMemo(() => packBoard(items, device), [items, device]);

  if (isLoading) return <SectionLoading />;

  return (
    <section className={boardRoot()} aria-label={t("board.regionLabel")}>
      <div className={boardGrid()} style={boardGridVars(device)}>
        {tiles.map((tile) => (
          <BoardTile key={tile.item.id} tile={tile} />
        ))}
      </div>
    </section>
  );
}
