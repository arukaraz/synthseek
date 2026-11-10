"use client";

import { Play } from "lucide-react";

import { CoverRequestAction } from "./CoverRequestAction";
import { cardAction } from "./styles";
import type { CoverActionButtonProps } from "./types";

export function CoverActionButton({ action }: CoverActionButtonProps) {
  if (action.kind === "request") return <CoverRequestAction action={action} placement="card" />;
  return (
    <button type="button" className={cardAction()} aria-label={action.label} onClick={action.onClick}>
      <Play />
    </button>
  );
}
