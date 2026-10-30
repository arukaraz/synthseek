"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { BOARD_COLUMNS, boardMetricsOf } from "@components/BoardGrid";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { ModalActionBar } from "@components/ui/ModalActionBar";
import { useElementHeight } from "@hooks/ui/useElementHeight";
import { useElementWidth } from "@hooks/ui/useElementWidth";

import { useBoardArrange } from "../../hooks/useBoardArrange";
import { packBoard, placementsById } from "../ExploreBoard/helpers";
import { galleryDialog } from "../WidgetGallery/styles";
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
  arrangeHeader,
  arrangeHint,
  arrangeNewRow,
  arrangeRoot,
  arrangeViewport,
} from "./styles";
import type { BoardArrangeDialogProps } from "./types";

export function BoardArrangeDialog({
  items,
  device,
  boardWidth,
  appearance,
  custom,
  customStatus,
  onSave,
  onClose,
}: BoardArrangeDialogProps) {
  const { t } = useTranslation("discover");
  const arrange = useBoardArrange({ items, custom });
  const [confirming, setConfirming] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
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
  const requestClose = () => (arrange.dirty ? setConfirming(true) : onClose());

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent
        animation="panel"
        className={galleryDialog({ workshop: true })}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          headerRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (openerRef.current?.isConnected) openerRef.current.focus();
        }}
      >
        <div ref={headerRef} tabIndex={-1} className={arrangeHeader()}>
          <DialogTitle>{t("board.arrange.title")}</DialogTitle>
          <DialogDescription className={arrangeHint()}>{t("board.arrange.hint")}</DialogDescription>
        </div>
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
        <ModalActionBar
          cancel={{ label: t("board.arrange.cancel"), onClick: requestClose }}
          save={{
            label: t("board.arrange.save"),
            onClick: () => onSave(arrange.draft),
            disabled: !arrange.dirty,
          }}
        />
        <ConfirmationModal
          isOpen={confirming}
          onClose={() => setConfirming(false)}
          onConfirm={onClose}
          title={t("board.arrange.discard.title")}
          message={t("board.arrange.discard.message")}
          confirmText={t("board.arrange.discard.confirm")}
          cancelText={t("board.arrange.discard.keep")}
          variant="warning"
        />
      </DialogContent>
    </Dialog>
  );
}
