"use client";

import type { ReactNode } from "react";

import { SettingsShell } from "@features/settings/components/SettingsShell/SettingsShell";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
