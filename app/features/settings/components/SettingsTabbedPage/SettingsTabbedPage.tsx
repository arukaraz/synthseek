"use client";

import { useTranslation } from "react-i18next";

import { useMaintenanceCounts } from "@hooks/api/queries/useMaintenanceCounts";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { SETTINGS_PAGE_BY_ID, SETTINGS_TABS } from "../../constants";
import { contentRoot } from "../../styles";
import { SettingsPageHeader } from "../SettingsPageHeader";
import { SettingsTabs } from "../SettingsTabs";
import type { SettingsTabbedPageProps } from "./types";

export function SettingsTabbedPage({ pageId, children }: SettingsTabbedPageProps) {
  const { t } = useTranslation("settings");
  const { isAdmin } = useAuthContext();
  const counts = useMaintenanceCounts(isAdmin && pageId === "maintenance");
  const page = SETTINGS_PAGE_BY_ID[pageId];
  const title = t(page.labelKey);

  const items = SETTINGS_TABS[pageId].map((tab) => ({
    href: tab.href,
    label: t(tab.labelKey),
    icon: tab.icon,
    count: tab.countKey ? counts.data?.[tab.countKey] : undefined,
  }));

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={title} description={t(page.descriptionKey)} />
      <SettingsTabs items={items} ariaLabel={title} />
      {children}
    </div>
  );
}
