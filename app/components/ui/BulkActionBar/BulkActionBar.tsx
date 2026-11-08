"use client";

import { X } from "lucide-react";

import { cn } from "@utils/cn";

import {
  prominentAction,
  selectionAction,
  selectionActionCount,
  selectionActionLabel,
  selectionActions,
  selectionBar,
  selectionChip,
  selectionChipDot,
  selectionChipNum,
  selectionClear,
  selectionCount,
  selectionCountLabel,
  selectionCountNum,
} from "./styles";
import type { BulkActionBarProps } from "./types";

export function BulkActionBar(props: BulkActionBarProps) {
  const { count, countLabel, clearLabel, onClear, trailing, className, ref } = props;

  if (props.appearance === "prominent") {
    return (
      <div ref={ref} className={cn(selectionBar({ appearance: "prominent" }), className)}>
        <button
          type="button"
          className={selectionClear({ appearance: "prominent" })}
          onClick={onClear}
          aria-label={clearLabel}
        >
          <X className="size-4" aria-hidden />
        </button>
        <p className={selectionCount()} role="status" aria-live="polite">
          <span className={selectionCountNum()}>{count}</span>
          <span className={selectionCountLabel()}>{countLabel}</span>
        </p>
        <div className={selectionActions()}>
          {props.actions.map(({ icon: Icon, label, onClick, disabled, tone }) => (
            <button
              key={label}
              type="button"
              className={prominentAction({ tone })}
              onClick={onClick}
              disabled={disabled}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
          {trailing}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn(selectionBar(), className)}>
      <span className={selectionChip()} role="status" aria-live="polite">
        <span className={selectionChipDot()} />
        <span className={selectionChipNum()}>{count}</span>
        {countLabel}
      </span>

      {props.actions.map(({ icon: Icon, label, onClick, count: actionCount, disabled }) => (
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
