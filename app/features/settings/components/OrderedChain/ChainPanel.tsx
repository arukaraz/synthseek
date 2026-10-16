"use client";

import { chainPanel } from "./styles";
import type { ChainPanelProps } from "./types";

export function ChainPanel({ children, label }: ChainPanelProps) {
  return (
    <section className={chainPanel()} aria-label={label}>
      {children}
    </section>
  );
}
