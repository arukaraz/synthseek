import type { SettingsBadgeKey, SettingsPage } from "../../types";

export interface SettingsSidebarProps {
  className?: string;
  query: string;
  onQueryChange: (next: string) => void;
}

export interface SidebarNavLinkProps {
  page: SettingsPage;
  active: boolean;
  attention: boolean;
}

export type SidebarAttention = Readonly<Record<SettingsBadgeKey, boolean>>;
