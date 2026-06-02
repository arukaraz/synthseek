"use client";

import { Check } from "lucide-react";

import {
  themeCard,
  themeCardFooter,
  themeCardHint,
  themeCardIndicator,
  themeCardIndicatorCheck,
  themeCardLabel,
  themeCardLabelGroup,
} from "./styles";
import { ThemePreview } from "./ThemePreview";
import type { ThemeCardOptionProps } from "./types";

export function ThemeCardOption({ option, selected, tabbable, onSelect, registerRef, onKeyNav }: ThemeCardOptionProps) {
  const accessibleName = option.hint ? `${option.label} (${option.hint})` : option.label;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={accessibleName}
      tabIndex={tabbable ? 0 : -1}
      ref={(node) => registerRef(option.value, node)}
      onClick={() => onSelect(option.value)}
      onKeyDown={(event) => onKeyNav(event, option.value)}
      className={themeCard({ selected })}
    >
      <ThemePreview preview={option.preview} />
      <span className={themeCardFooter()}>
        <span className={themeCardIndicator({ selected })}>
          {selected ? <Check className={themeCardIndicatorCheck()} /> : null}
        </span>
        <span className={themeCardLabelGroup()}>
          <span className={themeCardLabel({ selected })}>{option.label}</span>
          {option.hint ? <span className={themeCardHint()}>{option.hint}</span> : null}
        </span>
      </span>
    </button>
  );
}
