import type { LibraryMenuAction } from "../../types";

export interface LibraryActionMenuProps {
  actions: LibraryMenuAction[];
  title: string;
  subtitle?: string;
  triggerLabel: string;
  triggerClassName: string;
  iconClassName?: string;
}
