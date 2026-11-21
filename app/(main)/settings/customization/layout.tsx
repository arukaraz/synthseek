"use client";

import type { ReactNode } from "react";

import { SettingsTabbedPage } from "@features/settings/components/SettingsTabbedPage/SettingsTabbedPage";

export default function CustomizationLayout({ children }: { children: ReactNode }) {
  return <SettingsTabbedPage pageId="customization">{children}</SettingsTabbedPage>;
}
