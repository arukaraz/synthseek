"use client";

import type { ReactNode } from "react";

import { IntegrationTabs } from "@features/settings/components/IntegrationTabs";
import { SettingsPageHeader } from "@features/settings/components/SettingsPageHeader";
import { contentRoot } from "@features/settings/styles";

import { TABS } from "./constants";

export default function IntegrationsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="Integrations" />
      <IntegrationTabs items={TABS} />
      {children}
    </div>
  );
}
