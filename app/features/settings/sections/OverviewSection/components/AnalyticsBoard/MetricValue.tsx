import { Pill } from "../../../../components/Pill";
import { metricRow, metricUnit, metricValue } from "./styles";
import type { MetricValueProps } from "./types";

export function MetricValue({ value, unit, delta }: MetricValueProps) {
  return (
    <div className={metricRow()}>
      <span className={metricValue()}>{value}</span>
      {unit ? <span className={metricUnit()}>{unit}</span> : null}
      {delta ? <Pill tone={delta.tone}>{delta.label}</Pill> : null}
    </div>
  );
}
