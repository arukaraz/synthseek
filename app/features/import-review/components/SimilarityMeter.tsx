"use client";

import { METER_MID_SCORE } from "../constants";
import { compareLabelCell, compareValueCell, meterFill, meterLabel, meterRow, meterTrack } from "../styles";
import type { SimilarityMeterProps } from "../types";

export function SimilarityMeter({ label, score, caption }: SimilarityMeterProps) {
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <tr>
      <th scope="row" className={compareLabelCell({ className: "text-left font-normal" })}>
        {label}
      </th>
      <td colSpan={3} className={compareValueCell()}>
        <div className={meterRow()}>
          <div
            className={meterTrack()}
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clamped}
            aria-label={caption}
          >
            <i
              className={meterFill({ tone: clamped >= METER_MID_SCORE ? "mid" : "low" })}
              style={{ width: `${clamped}%` }}
            />
          </div>
          <span className={meterLabel()}>{caption}</span>
        </div>
      </td>
    </tr>
  );
}
