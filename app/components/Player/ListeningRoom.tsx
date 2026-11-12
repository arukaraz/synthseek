"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { cn } from "@utils/cn";
import { playerPanel, playerPanelFromTop } from "@utils/animations";

import { ListeningMember } from "./ListeningMember";
import { ROOM_PANEL_WIDTH_PX, ROOM_TOGGLE_SELECTOR } from "./constants";
import { labelled, panelClosesUpward, panelEdge, returnFocusTo } from "./helpers";
import {
  anchorVars,
  deviceCaption,
  iconButton,
  panelAnchor,
  panelSurface,
  queueHeader,
  queueTitle,
  roomBody,
  roomEmpty,
  roomSurface,
} from "./styles";
import { useAnchorRect } from "./useAnchorRect";
import type { PlayerPanelProps } from "./types";

export function ListeningRoom({ view, actions, chain, anchored = false, hanging = false }: PlayerPanelProps) {
  const { t } = useTranslation("player");
  const point = useAnchorRect(ROOM_TOGGLE_SELECTOR, anchored, ROOM_PANEL_WIDTH_PX);
  const edge = panelEdge(anchored, point, hanging);
  const { live, earlier } = view.listening;

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) actions.toggleRoom();
      }}
    >
      <DialogSurface
        className={panelAnchor({ width: "room", chain, anchored: anchored && point !== null })}
        style={anchorVars(point)}
        aria-describedby={undefined}
        onInteractOutside={(event) => {
          if (event.target instanceof Element && event.target.closest(ROOM_TOGGLE_SELECTOR) !== null) {
            event.preventDefault();
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo(ROOM_TOGGLE_SELECTOR);
        }}
      >
        <motion.div
          className={cn(panelSurface({ edge }), roomSurface())}
          variants={panelClosesUpward(edge, point) ? playerPanelFromTop : playerPanel}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={queueHeader()}>
            <DialogTitle asChild>
              <span className={queueTitle()}>{t("listening.title")}</span>
            </DialogTitle>
            <button
              type="button"
              className={iconButton()}
              onClick={actions.toggleRoom}
              {...labelled(t("listening.close"))}
            >
              <X className="size-4" />
            </button>
          </div>
          <div className={roomBody()}>
            {live.length === 0 ? <p className={roomEmpty()}>{t("listening.empty")}</p> : null}
            {live.map((member) => (
              <ListeningMember key={member.userId} member={member} />
            ))}
            {earlier.length > 0 ? <span className={deviceCaption()}>{t("listening.earlier")}</span> : null}
            {earlier.map((member) => (
              <ListeningMember key={member.userId} member={member} />
            ))}
          </div>
        </motion.div>
      </DialogSurface>
    </Dialog>
  );
}
