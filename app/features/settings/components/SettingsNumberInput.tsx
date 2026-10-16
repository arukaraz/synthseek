"use client";

import { useState } from "react";

import { Input } from "@components/ui/Input";
import { cn } from "@utils/cn";
import type { SettingsNumberInputProps, TypedNumber } from "./types";

export function SettingsNumberInput({
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  disabled,
  className,
  id,
  ariaLabel,
}: SettingsNumberInputProps) {
  const [typed, setTyped] = useState<TypedNumber | null>(null);
  const shown = typed !== null && Object.is(typed.value, value) ? typed.text : Number.isFinite(value) ? value : "";
  const clamp = (n: number): number => {
    let clamped = n;
    if (typeof min === "number" && clamped < min) clamped = min;
    if (typeof max === "number" && clamped > max) clamped = max;
    return clamped;
  };

  return (
    <div className={cn("relative inline-flex w-32 items-center", className)}>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        value={shown}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => {
          const next = e.target.valueAsNumber;
          const finite = Number.isFinite(next);
          setTyped({ text: e.target.value, value: finite ? next : value });
          if (finite) onChange(next);
        }}
        onBlur={(e) => {
          setTyped(null);
          const raw = e.target.valueAsNumber;
          if (!Number.isFinite(raw)) {
            if (typeof min === "number") onChange(min);
            return;
          }
          const clamped = clamp(raw);
          if (clamped !== raw) onChange(clamped);
        }}
        className={cn("text-right tabular-nums", suffix ? "pr-8" : undefined)}
      />
      {suffix ? <span className="text-fg/40 pointer-events-none absolute right-3 text-xs">{suffix}</span> : null}
    </div>
  );
}
