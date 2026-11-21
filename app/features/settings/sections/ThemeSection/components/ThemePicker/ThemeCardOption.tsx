"use client";

import { Check } from "lucide-react";

import { themeCard, themeCardFooter, themeCardIndicator, themeCardIndicatorCheck, themeCardLabel } from "./styles";
import { ThemePreview } from "./ThemePreview";
import type { ThemeCardOptionProps } from "./types";

export function ThemeCardOption({ option, selected, tabbable, onSelect, registerRef, onKeyNav }: ThemeCardOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={option.label}
      tabIndex={tabbable ? 0 : -1}
      ref={(node) => registerRef(option.value, node)}
      onClick={() => onSelect(option.value)}
      onKeyDown={(event) => onKeyNav(event, option.value)}
      className={themeCard({ selected })}
    >
      <ThemePreview paint={option.paint} />
      <span className={themeCardFooter()}>
        <span className={themeCardIndicator({ selected })}>
          {selected ? <Check className={themeCardIndicatorCheck()} /> : null}
        </span>
        <span className={themeCardLabel()}>{option.label}</span>
      </span>
    </button>
  );
}
