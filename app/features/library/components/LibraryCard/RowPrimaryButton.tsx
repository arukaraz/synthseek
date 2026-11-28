"use client";

import { rowPrimary } from "./styles";
import type { RowPrimaryButtonProps } from "./types";

export function RowPrimaryButton({ label, pressed, children }: RowPrimaryButtonProps) {
  return (
    <button type="button" data-row-primary aria-label={label} aria-pressed={pressed} className={rowPrimary()}>
      {children}
    </button>
  );
}
