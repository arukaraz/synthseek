"use client";

import { ArrowUpCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Avatar } from "@components/ui/Avatar";
import { NotificationBadge } from "@components/ui/NotificationBadge";
import { SETTINGS_ROOT } from "@features/settings/constants";
import { settingsHomeFor } from "@features/settings/helpers";
import { useVersionState } from "@hooks/api/subscriptions";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { settingsBadgeIcon, settingsLink } from "./styles";
import type { SettingsLinkProps } from "./types";

export function SettingsLink({ variant }: SettingsLinkProps) {
  const { t } = useTranslation("components");
  const { currentUser, isAdmin } = useAuthContext();
  const { updateAvailable, latestVersion } = useVersionState();

  if (!currentUser) return null;

  const label =
    updateAvailable && latestVersion !== null
      ? t("header.settingsUpdate", { version: latestVersion })
      : t("header.settings");

  return (
    <Link
      href={variant === "avatar" ? SETTINGS_ROOT : settingsHomeFor(isAdmin)}
      aria-label={label}
      className={settingsLink({ variant })}
    >
      {variant === "gear" ? (
        <Settings aria-hidden />
      ) : (
        <Avatar size="md" imageUrl={currentUser.avatar_url} username={currentUser.username} />
      )}
      <NotificationBadge visible={updateAvailable} label={t("header.updateAvailable")}>
        <ArrowUpCircle aria-hidden strokeWidth={2.5} className={settingsBadgeIcon()} />
      </NotificationBadge>
    </Link>
  );
}
