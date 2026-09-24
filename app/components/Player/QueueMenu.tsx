"use client";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { playerPanel, playerPanelFromTop } from "@utils/animations";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { QUEUE_TOGGLE_SELECTOR } from "./constants";
import { QueueBody } from "./QueueBody";
import { labelled, panelClosesUpward, panelEdge, returnFocusTo } from "./helpers";
import { iconButton, panelAnchor, panelSurface, queueHeader, queueTitle } from "./styles";
import type { PlayerPanelProps } from "./types";

export function QueueMenu({ view, actions, chain, hanging = false }: PlayerPanelProps) {
  const { t } = useTranslation("player");
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
            <button
              type="button"
              className={iconButton()}
              onClick={actions.toggleQueue}
              {...labelled(t("queue.close"))}
            >
              {panelClosesUpward(edge, null) ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
          <QueueBody view={view} actions={actions} />
        </motion.div>
      </DialogSurface>
    </Dialog>
  );
}
