"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { IntegrationTabs } from "@features/settings/components/IntegrationTabs";
import { SettingsPageHeader } from "@features/settings/components/SettingsPageHeader";
import { contentRoot } from "@features/settings/styles";

import { TAB_DEFINITIONS } from "./constants";

export default function IntegrationsLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation("appShell");

  const tabs = TAB_DEFINITIONS.map((tab) => ({
    href: tab.href,
    icon: tab.icon,
    label: t(tab.labelKey),
  }));

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("appShell.settings.integrations.title")} />
      <IntegrationTabs items={tabs} />
      {children}
    </div>
  );
}
