import type { ReactNode } from "react";

export type SidebarItemKey =
  | "shell.sidebar.items.general"
  | "shell.sidebar.items.members"
  | "shell.sidebar.items.profile"
  | "shell.sidebar.items.integrations"
  | "shell.sidebar.items.engine"
  | "shell.sidebar.items.jobs"
  | "shell.sidebar.items.logs"
  | "shell.sidebar.items.updates";

export interface NavItem {
  href: string;
  labelKey: SidebarItemKey;
  icon: ReactNode;
  adminOnly?: boolean;
}

export interface SettingsSidebarProps {
  className?: string;
}
