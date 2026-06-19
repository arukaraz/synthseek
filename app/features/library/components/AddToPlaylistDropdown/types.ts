import type { ReactNode } from "react";

export interface AddToPlaylistDropdownProps {
  trackIds: string[];
  onDone: () => void;
  trigger: ReactNode;
}
