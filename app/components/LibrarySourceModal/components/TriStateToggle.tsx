"use client";

import { useId } from "react";

import { TRI_TOGGLE_ARIA_CHECKED } from "../constants";
import {
  triToggle,
  triToggleGlyph,
  triToggleLabel,
  triToggleThumb,
  triToggleThumbMark,
  triToggleTrack,
} from "../styles";
import type { TriStateToggleProps } from "./types";

export function TriStateToggle({
  state,
  onActivate,
  label,
  glyph: Glyph,
  ariaLabel,
  disabled = false,
  description,
  descriptionId,
}: TriStateToggleProps) {
  const generatedId = useId();
  const describedBy = description ? (descriptionId ?? generatedId) : undefined;

  return (
    <span className={triToggle({ disabled })}>
      <Glyph className={triToggleGlyph()} aria-hidden />
      <span className={triToggleLabel()}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={TRI_TOGGLE_ARIA_CHECKED[state]}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        disabled={disabled}
        className={triToggleTrack({ state })}
        onClick={onActivate}
      >
        <span className={triToggleThumb({ state })}>
          {state === "mixed" ? <span className={triToggleThumbMark()} aria-hidden /> : null}
        </span>
      </button>
      {description ? (
        <span id={describedBy} className="sr-only">
          {description}
        </span>
      ) : null}
    </span>
  );
}
