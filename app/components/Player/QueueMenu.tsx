"use client";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { playerPanel, playerPanelFromTop } from "@utils/animations";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ListX } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { QUEUE_TOGGLE_SELECTOR } from "./constants";
import { QueueBody } from "./QueueBody";
import { labelled, panelClosesUpward, panelEdge, returnFocusTo } from "./helpers";
import {
  abovePlayerPanels,
  iconButton,
  panelAnchor,
  panelSurface,
  queueHeader,
  queueHeaderActions,
  queueTitle,
} from "./styles";
import type { PlayerPanelProps } from "./types";

export function QueueMenu({ view, actions, chain, hanging = false }: PlayerPanelProps) {
  const { t } = useTranslation("player");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const edge = panelEdge(false, null, hanging);
  return (
    <Dialog
      open
      modal={false}
      onOpenChange={(next) => {
        if (!next) actions.toggleQueue();
      }}
    >
      <DialogSurface
        className={panelAnchor({ width: "queue", chain, anchored: "column" })}
        aria-describedby={undefined}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo(QUEUE_TOGGLE_SELECTOR);
        }}
      >
        <motion.div
          className={panelSurface({ stretch: true, edge })}
          variants={panelClosesUpward(edge, null) ? playerPanelFromTop : playerPanel}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={queueHeader()}>
            <DialogTitle asChild>
              <span className={queueTitle()}>{t("queue.title")}</span>
            </DialogTitle>
            <div className={queueHeaderActions()}>
              {view.queueEditable ? (
                <button
                  type="button"
                  className={iconButton()}
                  onClick={() => setConfirmingClear(true)}
                  {...labelled(t("queue.clear"))}
                >
                  <ListX className="size-4" />
                </button>
              ) : null}
              <button
                type="button"
                className={iconButton()}
                onClick={actions.toggleQueue}
                {...labelled(t("queue.close"))}
              >
                {panelClosesUpward(edge, null) ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            </div>
          </div>
          <QueueBody view={view} actions={actions} />
        </motion.div>
      </DialogSurface>
      <ConfirmationModal
        isOpen={confirmingClear}
        onClose={() => setConfirmingClear(false)}
        onConfirm={actions.clearQueue}
        title={t("queue.clearTitle")}
        message={t("queue.clearMessage")}
        confirmText={t("queue.clear")}
        variant="danger"
        className={abovePlayerPanels()}
        overlayClassName={abovePlayerPanels()}
      />
    </Dialog>
  );
}
