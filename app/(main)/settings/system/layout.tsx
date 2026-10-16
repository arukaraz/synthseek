"use client";

import type { ReactNode } from "react";

import { SettingsTabbedPage } from "@features/settings/components/SettingsTabbedPage/SettingsTabbedPage";

export default function SystemLayout({ children }: { children: ReactNode }) {
  return <SettingsTabbedPage pageId="system">{children}</SettingsTabbedPage>;
}
