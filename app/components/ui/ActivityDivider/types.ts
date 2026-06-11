import type { ReactNode } from "react";

export type ActivityDividerState = "idle" | "in-progress" | "plex-sync";

export interface ActivityDividerProps {
  state: ActivityDividerState;
  value?: number;
  max?: number;
  children?: ReactNode;
  className?: string;
}
