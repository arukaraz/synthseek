"use client";

import { useTranslation } from "react-i18next";

import { useAuthContext } from "@modules/providers/AuthProvider";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot } from "../../styles";
import { MemberNtfyServerCard } from "./components/MemberNtfyServerCard";
import { NotificationDestinations } from "./components/NotificationDestinations";

export function NotificationsSection() {
  const { t } = useTranslation("settings");
  const { isAdmin } = useAuthContext();
  const page = SETTINGS_PAGE_BY_ID.notifications;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <NotificationDestinations />
      {isAdmin ? <MemberNtfyServerCard /> : null}
    </div>
  );
}
