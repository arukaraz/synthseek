"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { playerPanel, playerPanelFromTop } from "@utils/animations";

import { SETTINGS_TOGGLE_SELECTOR } from "./constants";
import { labelled, panelClosesUpward, panelEdge, returnFocusTo } from "./helpers";
import { SettingsSections } from "./SettingsSections";
import { iconButton, panelAnchor, panelSurface, queueHeader, queueTitle, settingsPanel } from "./styles";
import type { PlayerPanelProps } from "./types";

export function SettingsMenu({ view, actions, chain, hanging = false }: PlayerPanelProps) {
  const { t } = useTranslation("player");
  const edge = panelEdge(false, null, hanging);

  return (
    <Dialog
      open
      modal={false}
      onOpenChange={(next) => {
        if (!next) actions.toggleSettings();
      }}
    >
      <DialogSurface
        className={panelAnchor({ width: "settings", chain })}
        aria-describedby={undefined}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo(SETTINGS_TOGGLE_SELECTOR);
        }}
      >
        <motion.div
          className={panelSurface({ edge })}
          variants={panelClosesUpward(edge, null) ? playerPanelFromTop : playerPanel}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={queueHeader()}>
            <DialogTitle asChild>
              <span className={queueTitle()}>{t("settings.title")}</span>
            </DialogTitle>
            <button
              type="button"
              className={iconButton()}
              onClick={actions.toggleSettings}
              {...labelled(t("settings.close"))}
            >
              {panelClosesUpward(edge, null) ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
          <div className={settingsPanel()}>
            <SettingsSections view={view} actions={actions} />
          </div>
        </motion.div>
      </DialogSurface>
    </Dialog>
  );
}
