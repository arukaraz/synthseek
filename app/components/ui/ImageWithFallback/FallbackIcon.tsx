"use client";

import { responsiveFallbackIcon } from "../styles";
import type { FallbackIconProps } from "./types";

export function FallbackIcon({ Icon, size }: FallbackIconProps) {
  if (size === "fill") {
    return <Icon className={responsiveFallbackIcon({ size: "fill" })} />;
  }
  return <Icon className="text-primary-400 h-8 w-8" />;
}
