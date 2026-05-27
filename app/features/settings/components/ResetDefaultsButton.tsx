"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@components/ui/Button";
import type { ResetDefaultsButtonProps } from "./types";

export function ResetDefaultsButton({ onReset, disabled }: ResetDefaultsButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onReset}
      disabled={disabled}
      aria-label="Reset to defaults"
      className="text-fg/55 hover:text-fg h-7 px-2 text-xs"
    >
      <RotateCcw className="size-3.5" />
      Reset to defaults
    </Button>
  );
}
