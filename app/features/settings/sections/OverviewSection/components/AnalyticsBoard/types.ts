import type { ReactNode } from "react";

import type { BoardDevice } from "@components/BoardGrid";
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

export interface SparkPath {
  line: string;
  area: string;
}

export interface SparkBar {
  x: number;
  y: number;
  width: number;
  height: number;
  last: boolean;
}

export interface ClockPeak {
  day: number;
  hour: number;
  count: number;
}

export interface QualityRow {
  format: string;
  count: number;
  share: number;
}

export interface AnalyticsCellProps {
  device: BoardDevice;
  size: BoardSize;
  children: ReactNode;
}

export interface MetricValueProps {
  value: string;
  unit?: string;
  delta?: Delta | null;
}

export interface SparkProps {
  values: readonly number[];
  fill?: boolean;
}

export interface HeatGridProps {
  cells: readonly (readonly number[])[];
  weekdays: readonly string[];
}
