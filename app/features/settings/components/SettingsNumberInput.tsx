"use client";

import { Input } from "@components/ui/Input";
import { cn } from "@utils/cn";

interface SettingsNumberInputProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

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
  return (
    <div className={cn("relative inline-flex w-32 items-center", className)}>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => {
          const next = e.target.valueAsNumber;
          if (Number.isFinite(next)) onChange(next);
        }}
        className={cn("text-right tabular-nums", suffix ? "pr-8" : undefined)}
      />
      {suffix ? <span className="text-fg/40 pointer-events-none absolute right-3 text-xs">{suffix}</span> : null}
    </div>
  );
}
