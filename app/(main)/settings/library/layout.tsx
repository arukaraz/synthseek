"use client";

import type { ReactNode } from "react";

import { SettingsTabbedPage } from "@features/settings/components/SettingsTabbedPage/SettingsTabbedPage";

export default function LibraryLayout({ children }: { children: ReactNode }) {
  return <SettingsTabbedPage pageId="library">{children}</SettingsTabbedPage>;
}
