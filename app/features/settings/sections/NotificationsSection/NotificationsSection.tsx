"use client";

import { useTranslation } from "react-i18next";

import { useAuthContext } from "@modules/providers/AuthProvider";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { MemberNtfyServerCard } from "./components/MemberNtfyServerCard";
import { NotificationDestinations } from "./components/NotificationDestinations";

export function NotificationsSection() {
  const { t } = useTranslation("settings");
  const { isAdmin } = useAuthContext();

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("notifications.pageTitle")} description={t("notifications.pageDescription")} />
      <NotificationDestinations />
      {isAdmin ? <MemberNtfyServerCard /> : null}
    </div>
  );
}
