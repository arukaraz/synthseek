"use client";

import { Input } from "@components/ui/Input";

import { clampedNumber } from "./helpers";
import { numberInput } from "./styles";
import type { NumberFieldProps } from "./types";

export function NumberField({ value, min, max, step = 1, label, onChange }: NumberFieldProps) {
  return (
    <Input
      type="number"
      size="sm"
      inputMode="numeric"
      className={numberInput()}
      value={value}
      min={min}
      max={max}
      step={step}
      aria-label={label}
      onChange={(event) => {
        const next = clampedNumber(event.target.value, min, max);
        if (next !== null) onChange(next);
      }}
    />
  );
}
