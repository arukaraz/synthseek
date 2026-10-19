import type { ChartEntry } from "@hooks/api/queries/analytics/types";

export interface ChartActionProps {
  entry: ChartEntry;
}

export interface ChartsLeaderProps {
  entry: ChartEntry;
  country: string;
}
