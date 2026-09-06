"use client";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { playerPanel } from "@utils/animations";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { MODE_ICONS, MODES_TOGGLE_SELECTOR, SELECTABLE_PLAYER_MODES } from "./constants";
import { returnFocusTo } from "./helpers";
import { miniPlayerSupported } from "./miniWindow";
import {
  deviceCaption,
  deviceIcon,
  deviceList,
  deviceName,
  deviceRow,
  modeHint,
  panelAnchor,
  panelSurface,
} from "./styles";
import type { PlayerPanelProps } from "./types";

export function PlayerModeMenu({ actions, chain }: PlayerPanelProps) {
  const { t } = useTranslation("player");

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) actions.toggleModes();
      }}
    >
      <DialogSurface
        className={panelAnchor({ width: "devices", chain })}
        aria-describedby={undefined}
        onInteractOutside={(event) => {
          if (event.target instanceof Element && event.target.closest(MODES_TOGGLE_SELECTOR) !== null) {
            event.preventDefault();
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo(MODES_TOGGLE_SELECTOR);
        }}
      >
        <motion.div className={panelSurface()} variants={playerPanel} initial="hidden" animate="visible" exit="exit">
          <div className={deviceList()}>
            <DialogTitle asChild>
              <span className={deviceCaption()}>{t("modes.caption")}</span>
            </DialogTitle>
            {SELECTABLE_PLAYER_MODES.map((mode) => {
              const Icon = MODE_ICONS[mode];
              const unavailable = mode === "mini" && !miniPlayerSupported();
              return (
                <button
                  key={mode}
                  type="button"
                  disabled={unavailable}
                  className={deviceRow({ muted: unavailable })}
                  onClick={() => actions.selectMode(mode)}
                >
                  <Icon className={deviceIcon()} />
                  <span className={deviceName()}>{t(`modes.${mode}`)}</span>
                  {unavailable ? <span className={modeHint()}>{t("modes.unsupported")}</span> : null}
                </button>
              );
            })}
          </div>
        </motion.div>
      </DialogSurface>
    </Dialog>
  );
}
