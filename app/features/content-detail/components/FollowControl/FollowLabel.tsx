"use client";

import { useTranslation } from "react-i18next";

import { followLabelGhost, followLabelLive, followLabelStack } from "./styles";
import type { FollowLabelProps } from "./types";

export function FollowLabel({ live }: FollowLabelProps) {
  const { t } = useTranslation("follows");

  return (
    <span className={followLabelStack()}>
      <span className={followLabelGhost()} aria-hidden>
        {t("control.follow")}
      </span>
      <span className={followLabelGhost()} aria-hidden>
        {t("control.following")}
      </span>
      <span className={followLabelLive()}>{live === "following" ? t("control.following") : t("control.follow")}</span>
    </span>
  );
}
