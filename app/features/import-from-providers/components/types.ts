import type { ProviderKey } from "../types";

export interface ProviderSidebarProps {
  active: ProviderKey;
  onChange: (provider: ProviderKey) => void;
}

export interface ImportFooterProps {
  totalSelected: number;
  onImport: () => void;
  onCancel: () => void;
  onSyncAll?: () => void;
  isPending: boolean;
  isSyncAllPending?: boolean;
  canSyncAll?: boolean;
}

export type SidebarBadgeTone = "success" | "warning" | "neutral";

export interface SidebarBadgeInfo {
  label: string;
  tone: SidebarBadgeTone;
}
