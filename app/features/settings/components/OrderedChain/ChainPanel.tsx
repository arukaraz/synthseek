"use client";

import { chainPanel } from "./styles";
import type { ChainPanelProps } from "./types";

export function ChainPanel({ children, label, panelRef }: ChainPanelProps) {
  return (
    <section ref={panelRef} className={chainPanel()} aria-label={label}>
      {children}
    </section>
  );
}
