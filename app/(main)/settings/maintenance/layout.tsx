"use client";

import type { ReactNode } from "react";

import { SettingsTabbedPage } from "@features/settings/components/SettingsTabbedPage/SettingsTabbedPage";

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return <SettingsTabbedPage pageId="maintenance">{children}</SettingsTabbedPage>;
}
