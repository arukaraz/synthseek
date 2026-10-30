"use client";

import { X } from "lucide-react";

import { IconButton } from "@components/ui/IconButton";

import { stepControls, stepLabel, stepRemove, stepRow } from "./styles";
import type { StepRowProps } from "./types";

export function StepRow({ label, children, onRemove, removeLabel }: StepRowProps) {
  return (
    <div className={stepRow()} role="group" aria-label={label}>
      <span className={stepLabel()}>{label}</span>
      <div className={stepControls()}>{children}</div>
      {onRemove && removeLabel ? (
        <IconButton
          icon={X}
          size="sm"
          animated={false}
          className={stepRemove()}
          aria-label={removeLabel}
          onClick={onRemove}
        />
      ) : null}
    </div>
  );
}
