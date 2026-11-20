"use client";

import { cn } from "@utils/cn";

import { lowThumbLeads, rangeFillInset } from "./helpers";
import { rangeSliderFill, rangeSliderRail, rangeSliderRoot, rangeSliderThumb, rangeSliderTrack } from "./styles";
import type { RangeSliderProps } from "./types";

export function RangeSlider({
  min,
  max,
  step = 1,
  low,
  high,
  onChange,
  lowLabel,
  highLabel,
  className,
}: RangeSliderProps) {
  const lowLeads = lowThumbLeads(min, max, low);
  const fillInset = rangeFillInset(min, max, low, high);

  return (
    <div className={cn(rangeSliderRoot(), className)}>
      <div className={rangeSliderRail()}>
        <div className={rangeSliderTrack()} />
        <div className={rangeSliderFill()} style={{ insetInline: fillInset }} />
      </div>
      <input
        type="range"
        className={rangeSliderThumb({ leads: lowLeads })}
        min={min}
        max={max}
        step={step}
        value={low}
        aria-label={lowLabel}
        onChange={(event) => onChange(Math.min(Number(event.target.value), high), high)}
      />
      <input
        type="range"
        className={rangeSliderThumb({ leads: !lowLeads })}
        min={min}
        max={max}
        step={step}
        value={high}
        aria-label={highLabel}
        onChange={(event) => onChange(low, Math.max(Number(event.target.value), low))}
      />
    </div>
  );
}
