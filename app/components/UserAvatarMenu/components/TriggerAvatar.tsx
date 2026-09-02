"use client";

import { Avatar } from "@components/ui/Avatar";
import { NotificationBadge } from "@components/ui/NotificationBadge";
import { ArrowUpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { triggerAvatarWrapper } from "../styles";
import type { TriggerAvatarProps } from "../types";

export function TriggerAvatar({ username, avatarUrl, updateAvailable }: TriggerAvatarProps) {
  const { t } = useTranslation("components");
  return (
    <span className={triggerAvatarWrapper()}>
      <Avatar size="md" imageUrl={avatarUrl} username={username} />

      <NotificationBadge visible={updateAvailable} label={t("userMenu.updateAvailable")}>
        <ArrowUpCircle aria-hidden strokeWidth={2.5} className="h-3.5 w-3.5" />
      </NotificationBadge>
    </span>
  );
}
