"use client";

import { ArrowLeft } from "lucide-react";

import { backButton } from "../../styles";
import type { DetailBackButtonProps } from "./types";

export function DetailBackButton({ label, ariaLabel, onClick }: DetailBackButtonProps) {
  return (
    <button type="button" className={backButton()} aria-label={ariaLabel} onClick={onClick}>
      <ArrowLeft className="size-5" aria-hidden />
      {label}
    </button>
  );
}
