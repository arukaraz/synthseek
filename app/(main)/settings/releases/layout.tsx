"use client";

import type { ReactNode } from "react";

import { SettingsTabbedPage } from "@features/settings/components/SettingsTabbedPage/SettingsTabbedPage";

export default function ReleasesLayout({ children }: { children: ReactNode }) {
  return <SettingsTabbedPage pageId="releases">{children}</SettingsTabbedPage>;
}
