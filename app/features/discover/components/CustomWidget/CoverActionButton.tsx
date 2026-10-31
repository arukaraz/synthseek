"use client";

import { Download, Play } from "lucide-react";

import { cardAction } from "./styles";
import type { CoverActionButtonProps } from "./types";

export function CoverActionButton({ action }: CoverActionButtonProps) {
  return (
    <button type="button" className={cardAction()} aria-label={action.label} onClick={action.onClick}>
      {action.kind === "play" ? <Play /> : <Download />}
    </button>
  );
}
