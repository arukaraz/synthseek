"use client";

import type { ReactNode } from "react";

import { SettingsTabbedPage } from "@features/settings/components/SettingsTabbedPage/SettingsTabbedPage";

export default function AppearanceLayout({ children }: { children: ReactNode }) {
  return <SettingsTabbedPage pageId="appearance">{children}</SettingsTabbedPage>;
}
