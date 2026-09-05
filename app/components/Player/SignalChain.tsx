"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { playerPanel } from "@utils/animations";

import { chainLabel, chainSeparator, chainStrip, chainValue } from "./styles";
import type { PlayerProps } from "./types";

export function SignalChain({ view }: PlayerProps) {
  const { t } = useTranslation("player");
  const { chain } = view;

  return (
    <motion.div className={chainStrip()} variants={playerPanel} initial="hidden" animate="visible" exit="exit">
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
      <span className={chainLabel()}>{t("chain.output")}</span>
      <span className={chainValue({ tone: view.activeDevice.local ? "neutral" : "lossless" })}>
        {view.activeDevice.name}
      </span>
    </motion.div>
  );
}
