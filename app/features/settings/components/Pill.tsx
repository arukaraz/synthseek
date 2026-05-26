"use client";

import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { pill } from "../styles";

interface PillProps extends VariantProps<typeof pill> {
  children: ReactNode;
}

export function Pill({ children, tone }: PillProps) {
  return <span className={pill({ tone })}>{children}</span>;
}
