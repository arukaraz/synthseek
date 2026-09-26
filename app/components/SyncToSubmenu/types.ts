import type { MediaServerKey } from "@api/__generated__/types";

export interface SyncToSubmenuProps {
  label: string;
  excludeServer?: string | null;
  disabled?: boolean;
  triggerClassName?: string;
  onSelect: (server: MediaServerKey) => void;
}
