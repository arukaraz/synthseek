"use client";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { playerPanel, playerPanelFromTop } from "@utils/animations";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { QUEUE_TOGGLE_SELECTOR } from "./constants";
import { QueueBody } from "./QueueBody";
import { QueueHeader } from "./QueueHeader";
import { panelClosesUpward, panelEdge, returnFocusTo } from "./helpers";
import { panelAnchor, panelSurface, queueTitle } from "./styles";
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
          <QueueHeader
            view={view}
            actions={actions}
            title={
              <DialogTitle asChild>
                <span className={queueTitle()}>{t("queue.title")}</span>
              </DialogTitle>
            }
            closeIcon={
              panelClosesUpward(edge, null) ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
            }
          />
          <QueueBody view={view} actions={actions} />
        </motion.div>
      </DialogSurface>
    </Dialog>
  );
}
