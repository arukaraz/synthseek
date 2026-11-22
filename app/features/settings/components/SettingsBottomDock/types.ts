import type { ReactNode } from "react";

export interface SettingsBottomDockProviderProps {
  dock: HTMLElement | null;
  children: ReactNode;
}

export interface DockedToBottomProps {
  children: ReactNode;
}
