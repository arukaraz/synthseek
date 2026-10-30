import type { ReactNode } from "react";

import type { BoardDevice, BoardHeight } from "@components/BoardGrid";
import type { BoardSize } from "@hooks/api/queries/board/types";

export type DeltaTone = "success" | "danger" | "muted";

export interface Delta {
  label: string;
  tone: DeltaTone;
}

export interface WindowTotals {
  current: number;
  previous: number;
}

export interface QualityRow {
  format: string;
  count: number;
  share: number;
}

export interface AnalyticsCellProps {
  device: BoardDevice;
  size: BoardSize;
  height: BoardHeight;
  children: ReactNode;
}

export interface MetricValueProps {
  value: string;
  unit?: string;
  delta?: Delta | null;
}
