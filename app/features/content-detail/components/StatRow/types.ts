import type { StatItem } from "../../types";

export type StatRowLayout = "aside" | "inline";

export interface StatRowProps {
  stats: StatItem[];
  layout?: StatRowLayout;
}
