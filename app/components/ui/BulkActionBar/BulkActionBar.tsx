"use client";

import { X } from "lucide-react";

import {
  selectionAction,
  selectionActionCount,
  selectionActionLabel,
  selectionBar,
  selectionChip,
  selectionChipDot,
  selectionChipNum,
  selectionClear,
} from "./styles";
import type { BulkActionBarProps } from "./types";

export function BulkActionBar({ count, countLabel, actions, clearLabel, onClear, trailing }: BulkActionBarProps) {
  return (
    <div className={selectionBar()}>
      <span className={selectionChip()}>
        <span className={selectionChipDot()} />
        <span className={selectionChipNum()}>{count}</span>
        {countLabel}
      </span>

      {actions.map(({ icon: Icon, label, onClick, count: actionCount, disabled }) => (
        <button
          key={label}
          type="button"
          className={selectionAction()}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          <Icon className="size-3.5 shrink-0" aria-hidden />
          {actionCount !== undefined ? (
            <span className={selectionActionCount()} aria-hidden>
              {actionCount}
            </span>
          ) : null}
          <span className={selectionActionLabel()} aria-hidden>
            {label}
          </span>
        </button>
      ))}

      {trailing}

      <button type="button" className={selectionClear()} onClick={onClear} aria-label={clearLabel}>
        <X className="size-3.5 shrink-0" aria-hidden />
        <span className={selectionActionLabel()} aria-hidden>
          {clearLabel}
        </span>
      </button>
    </div>
  );
}
