"use client";

import { pill } from "../styles";
import type { PillProps } from "./types";

export function Pill({ children, tone }: PillProps) {
  return <span className={pill({ tone })}>{children}</span>;
}
