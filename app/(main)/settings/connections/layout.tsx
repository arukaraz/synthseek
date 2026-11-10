"use client";

import type { ReactNode } from "react";

import { SettingsTabbedPage } from "@features/settings/components/SettingsTabbedPage/SettingsTabbedPage";

export default function ConnectionsLayout({ children }: { children: ReactNode }) {
  return <SettingsTabbedPage pageId="connections">{children}</SettingsTabbedPage>;
}
