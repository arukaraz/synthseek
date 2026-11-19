"use client";

import { segmentedControl, segmentedOption } from "./styles";
import type { SegmentedControlProps } from "./types";

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  disabled,
  ariaLabel,
  block = false,
  glyphOnlyOnPhone = false,
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={segmentedControl({ block })}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const collapses = glyphOnlyOnPhone && Icon !== undefined;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            disabled={disabled || opt.disabled}
            onClick={() => onChange(opt.value)}
            className={segmentedOption({
              active: value === opt.value,
              block,
              unavailable: opt.disabled === true,
              withIcon: Icon !== undefined,
            })}
          >
            {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
            {collapses ? <span className="max-sm:sr-only">{opt.label}</span> : opt.label}
          </button>
        );
      })}
    </div>
  );
}
