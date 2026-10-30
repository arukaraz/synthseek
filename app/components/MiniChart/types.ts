export type MiniChartTone = "primary" | "accent";

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

export interface SparkProps {
  values: readonly number[];
  fill?: boolean;
  tone?: MiniChartTone;
}

export interface HeatPeak {
  day: number;
  hour: number;
  count: number;
}

export interface HeatGridProps {
  cells: readonly (readonly number[])[];
  weekdays: readonly string[];
  label: string;
  cellTitle: (day: string, hour: number, count: number) => string;
  hourLabel: (hour: number) => string;
  tone?: MiniChartTone;
}
