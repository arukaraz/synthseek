"use client";

import { useTranslation } from "react-i18next";

import { moreAttention } from "./helpers";
import type { MoreAttentionLabel, MoreMenuLayout, PlayerView } from "./types";

export function useMoreAttention(
  view: PlayerView,
  layout: MoreMenuLayout = "narrow",
  compact = false
): MoreAttentionLabel {
  const { t } = useTranslation("player");
  const attention = moreAttention(view, layout, compact);
  const attentionText =
    attention === "remote"
      ? t("menu.playingOn", { device: view.activeDevice.name })
      : attention === "warning"
        ? t("scrobble.retrying")
        : attention === "danger"
          ? t("scrobble.failed")
          : attention === "private"
            ? t("privateSession.on")
            : attention === "friends" || attention === "arrival"
              ? t("listening.count", { count: view.listening.live.length })
              : null;
  const name = attentionText === null ? t("controls.more") : `${t("controls.more")}: ${attentionText}`;
  return { attention, name };
}
