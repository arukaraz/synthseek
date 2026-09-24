"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { playerPanel, playerPanelFromTop } from "@utils/animations";

import { CompressorSection } from "./CompressorSection";
import { ConversionSection } from "./ConversionSection";
import { EqualizerSection } from "./EqualizerSection";
import { LoudnessSection } from "./LoudnessSection";
import { SETTINGS_PANEL_WIDTH_PX, SETTINGS_TOGGLE_SELECTOR } from "./constants";
import { labelled, panelClosesUpward, panelEdge, returnFocusTo } from "./helpers";
import { anchorVars, iconButton, panelAnchor, panelSurface, queueHeader, queueTitle, settingsPanel } from "./styles";
import { useAnchorRect } from "./useAnchorRect";
import type { PlayerPanelProps } from "./types";

export function SettingsMenu({ view, actions, chain, anchored = false, hanging = false }: PlayerPanelProps) {
  const { t } = useTranslation("player");
  const point = useAnchorRect(SETTINGS_TOGGLE_SELECTOR, anchored, SETTINGS_PANEL_WIDTH_PX);
  const edge = panelEdge(anchored, point, hanging);

  return (
    <Dialog
      open
      modal={false}
      onOpenChange={(next) => {
        if (!next) actions.toggleSettings();
      }}
    >
      <DialogSurface
        className={panelAnchor({ width: "settings", chain, anchored: anchored && point !== null })}
        style={anchorVars(point)}
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
          variants={panelClosesUpward(edge, point) ? playerPanelFromTop : playerPanel}
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
              {panelClosesUpward(edge, point) ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
          <div className={settingsPanel()}>
            <EqualizerSection view={view} actions={actions} />
            <CompressorSection view={view} actions={actions} />
            <LoudnessSection view={view} actions={actions} />
            <ConversionSection view={view} actions={actions} />
          </div>
        </motion.div>
      </DialogSurface>
    </Dialog>
  );
}
