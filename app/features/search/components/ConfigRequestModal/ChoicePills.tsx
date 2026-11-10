"use client";

import { choicePill, choicePills } from "./styles";
import type { ChoicePillsProps } from "./types";

export function ChoicePills<T extends string>({ ariaLabel, options, value, onChange }: ChoicePillsProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={choicePills()}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={choicePill({ active: option.value === value })}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
