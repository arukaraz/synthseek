"use client";

import { cn } from "@utils/cn";

import { loadingDots } from "./styles";
import type { LoadingDotsProps } from "./types";

export function LoadingDots({ size, className, label = "Loading" }: LoadingDotsProps) {
  return (
    <span role="status" aria-label={label} className={cn(loadingDots({ size }), className)}>
      <span />
      <span />
      <span />
    </span>
  );
}
