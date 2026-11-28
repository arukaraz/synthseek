import { summaryLabel, summaryPill, summaryRow } from "../styles";
import type { SummaryRowProps } from "../types";

export function SummaryRow({ label, value, outcome }: SummaryRowProps) {
  return (
    <li className={summaryRow()}>
      <span className={summaryLabel()}>{label}</span>
      <span className={summaryPill({ outcome: outcome ?? "open" })}>{value}</span>
    </li>
  );
}
