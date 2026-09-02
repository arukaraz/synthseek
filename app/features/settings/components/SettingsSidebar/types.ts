import type { ReactNode } from "react";

import type { MaintenanceCounts } from "@features/settings/sections/MaintenanceSection/types";

export type SidebarItemKey =
  | "shell.sidebar.items.general"
  | "shell.sidebar.items.members"
  | "shell.sidebar.items.profile"
  | "shell.sidebar.items.integrations"
  | "shell.sidebar.items.engine"
  | "shell.sidebar.items.jobs"
  | "shell.sidebar.items.logs"
  | "shell.sidebar.items.updates"
  | "shell.sidebar.items.maintenance"
  | "shell.sidebar.items.review"
  | "shell.sidebar.items.duplicates"
  | "shell.sidebar.items.recycleBin"
  | "shell.sidebar.items.quarantine";

export interface NavItem {
  kind: "item";
  href: string;
  labelKey: SidebarItemKey;
  icon: ReactNode;
  adminOnly?: boolean;
}

export interface NavBranch {
  kind: "branch";
  href: string;
  labelKey: SidebarItemKey;
  icon: ReactNode;
  adminOnly?: boolean;
  children: NavLeaf[];
}

export type AdvancedEntry = NavItem | NavBranch;

export interface NavLeaf {
  href: string;
  labelKey: SidebarItemKey;
  countKey: keyof MaintenanceCounts;
}

export interface SettingsSidebarProps {
  className?: string;
}

export interface MaintenanceBranchProps {
  branch: NavBranch;
  counts: MaintenanceCounts | undefined;
  pathname: string;
}
