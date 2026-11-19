"use client";

import type { ReactNode } from "react";

import { SettingsTabbedPage } from "@features/settings/components/SettingsTabbedPage/SettingsTabbedPage";

export default function DownloadLayout({ children }: { children: ReactNode }) {
  return <SettingsTabbedPage pageId="download">{children}</SettingsTabbedPage>;
}
