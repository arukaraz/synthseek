"use client";

import { useTranslation } from "react-i18next";

import { moreAttention } from "./helpers";
import type { MoreAttentionLabel, PlayerView } from "./types";

export function useMoreAttention(view: PlayerView): MoreAttentionLabel {
  const { t } = useTranslation("player");
  const attention = moreAttention(view);
  const attentionText =
    attention === "remote"
      ? t("menu.playingOn", { device: view.activeDevice.name })
      : attention === "warning"
        ? t("scrobble.retrying")
        : attention === "danger"
          ? t("scrobble.failed")
          : null;
  const name = attentionText === null ? t("controls.more") : `${t("controls.more")}: ${attentionText}`;
  return { attention, name };
}
