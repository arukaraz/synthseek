"use client";

import { Trash2 } from "lucide-react";

import { IconButton } from "@components/ui/IconButton";

import { stepControls, stepLabel, stepRemove, stepRow } from "./styles";
import type { StepRowProps } from "./types";

export function StepRow({ label, info, children, onRemove, removeLabel, flush = false }: StepRowProps) {
  return (
    <div className={stepRow({ flush })} role="group" aria-label={label}>
      <span className={stepLabel()}>
        {label}
        {info}
      </span>
      <div className={stepControls()}>{children}</div>
      {onRemove && removeLabel ? (
        <IconButton
          icon={Trash2}
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
