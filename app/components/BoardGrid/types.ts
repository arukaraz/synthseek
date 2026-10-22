import type { ReactNode } from "react";

export type BoardDevice = "wide" | "narrow";

export type BoardHeight = "short" | "regular" | "tall";

export interface BoardSpan {
  cols: number;
  rows: number;
}

export interface BoardGridProps {
  device: BoardDevice;
  children: ReactNode;
}
