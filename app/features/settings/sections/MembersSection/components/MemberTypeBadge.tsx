"use client";

import { useTranslation } from "react-i18next";

import { pill } from "../styles";
import type { MemberTypeBadgeProps } from "../types";

export function MemberTypeBadge({ isPlexUser }: MemberTypeBadgeProps) {
  const { t } = useTranslation("settings");

  return (
    <span className={pill({ tone: isPlexUser ? "plex" : "local" })}>
      {isPlexUser ? t("members.type.plex") : t("members.type.local")}
    </span>
  );
}
