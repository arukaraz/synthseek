"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { playerPanel, playerPanelFromTop } from "@utils/animations";

import { chainButton, chainLabel, chainSeparator, chainStrip, chainValue } from "./styles";
import type { PlayerSignalChainProps } from "./types";

export function SignalChain({ view, actions, placement = "dock" }: PlayerSignalChainProps) {
  const { t } = useTranslation("player");
  const { chain } = view;

  return (
    <motion.div
      className={chainStrip({ placement })}
      variants={placement === "header" ? playerPanelFromTop : playerPanel}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <span className={chainLabel()}>{t("chain.file")}</span>
      <span
        className={chainValue({ tone: chain.transcoding ? "warning" : view.track.lossless ? "lossless" : "muted" })}
      >
        {chain.fileLabel}
      </span>
      <ChevronRight className={chainSeparator()} aria-hidden />
      <span className={chainLabel()}>{t("chain.server")}</span>
      <span className={chainValue({ tone: chain.transcoding ? "warning" : "success" })}>{chain.serverLabel}</span>
      <ChevronRight className={chainSeparator()} aria-hidden />
      <span className={chainLabel()}>{t("chain.equalizer")}</span>
      <button
        type="button"
        className={chainButton({ tone: chain.equalizerActive ? "active" : "muted" })}
        onClick={actions.toggleSettings}
        aria-expanded={view.settingsOpen}
        aria-label={`${t("controls.settings")}: ${chain.equalizerLabel}`}
        data-player-settings-toggle
      >
        {chain.equalizerLabel}
      </button>
      <ChevronRight className={chainSeparator()} aria-hidden />
      <span className={chainLabel()}>{t("chain.output")}</span>
      <span className={chainValue({ tone: view.activeDevice.local ? "neutral" : "lossless" })}>
        {view.activeDevice.name}
      </span>
    </motion.div>
  );
}
