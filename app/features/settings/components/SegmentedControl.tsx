"use client";

import { segmentedControl, segmentedOption } from "../styles";
import type { SegmentedControlProps } from "./types";

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  disabled,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={segmentedControl()}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={segmentedOption({ active: value === opt.value })}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
