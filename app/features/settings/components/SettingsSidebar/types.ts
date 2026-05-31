import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

export interface SettingsSidebarProps {
  className?: string;
}
