import type { MediaServerKey } from "@api/__generated__/types";

export interface SyncDestination {
  server: MediaServerKey;
  name: string;
}

export interface SyncTargetItemsProps {
  destinations: readonly SyncDestination[];
  disabled?: boolean;
  onSelect: (server: MediaServerKey) => void;
}

export interface SyncToSubmenuProps {
  label: string;
  excludeServer?: string | null;
  disabled?: boolean;
  triggerClassName?: string;
  onSelect: (server: MediaServerKey) => void;
}
