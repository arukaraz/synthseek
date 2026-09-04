"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { chainLabel, chainSeparator, chainStrip, chainValue } from "./styles";
import type { PlayerProps } from "./types";

export function SignalChain({ view }: PlayerProps) {
  const { t } = useTranslation("player");
  const { chain } = view;

  return (
    <div className={chainStrip()}>
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
    </div>
  );
}
