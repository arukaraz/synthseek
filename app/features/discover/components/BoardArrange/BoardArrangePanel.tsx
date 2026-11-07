"use client";

import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { BOARD_COLUMNS, boardMetricsOf } from "@components/BoardGrid";
import { useElementHeight } from "@hooks/ui/useElementHeight";
import { useElementWidth } from "@hooks/ui/useElementWidth";

import { packBoard, placementsById } from "../ExploreBoard/helpers";
import { ArrangeTile } from "./ArrangeTile";
import { arrangeLayoutOf } from "./helpers";
import {
  arrangeBoard,
  arrangeBoardVars,
  arrangeEmpty,
  arrangeFrame,
  arrangeGrid,
  arrangeGuide,
  arrangeGuides,
  arrangeNewRow,
  arrangeRoot,
  arrangeViewport,
} from "./styles";
import type { BoardArrangePanelProps } from "./types";

export function BoardArrangePanel({
  arrange,
  device,
  boardWidth,
  appearance,
  custom,
  customStatus,
}: BoardArrangePanelProps) {
  const { t } = useTranslation("discover");
  const [measureWidth, width] = useElementWidth<HTMLDivElement>();
  const [measureHeight, height] = useElementHeight<HTMLDivElement>();
  const measure = useCallback(
    (node: HTMLDivElement | null) => {
      measureWidth(node);
      measureHeight(node);
    },
    [measureHeight, measureWidth]
  );

  const placements = useMemo(
    () => placementsById(packBoard(arrange.displayItems, device, custom)),
    [arrange.displayItems, device, custom]
  );
  const settled = useMemo(() => packBoard(arrange.draft, device, custom), [arrange.draft, device, custom]);
  const base = boardMetricsOf(appearance);
  const layout = arrangeLayoutOf({ width, height }, device, boardWidth, settled, base);

  return (
    <div className={arrangeFrame()}>
      <div ref={measure} className={arrangeViewport()}>
        {arrange.draft.length === 0 ? (
          <p className={arrangeEmpty()}>{t("board.arrange.empty")}</p>
        ) : layout.scale > 0 ? (
          <section ref={arrange.rootRef} className={arrangeRoot()}>
            <div className={arrangeBoard()} style={arrangeBoardVars(device, appearance, layout)}>
              <div className={arrangeGuides()} aria-hidden>
                {Array.from({ length: BOARD_COLUMNS[device] }, (_, column) => (
                  <span key={column} className={arrangeGuide()} />
                ))}
              </div>
              <div className={arrangeGrid()}>
                {arrange.draft.map((item, index) => {
                  const tile = placements.get(item.id);
                  if (!tile) return null;
                  return (
                    <ArrangeTile
                      key={item.id}
                      tile={tile}
                      device={device}
                      boardWidth={boardWidth}
                      metrics={base}
                      layout={layout}
                      custom={custom}
                      customStatus={customStatus}
                      dragging={arrange.draggingId === item.id}
                      position={index + 1}
                      total={arrange.draft.length}
                      actions={arrange.actions}
                    />
                  );
                })}
              </div>
              <div className={arrangeNewRow()} aria-hidden>
                {t("board.arrange.newRow")}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
