"use client";

import type { ReactNode } from "react";

import { engineRow } from "../styles";

interface EngineRowProps {
  label: string;
  labelTrailing?: ReactNode;
  description: string;
  control: ReactNode;
  anchor?: string;
}

export function EngineRow({ label, labelTrailing, description, control, anchor }: EngineRowProps) {
  return (
    <div className={engineRow()} data-anchor-target={anchor}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-fg text-sm font-medium">{label}</span>
          {labelTrailing}
        </div>
        <span className="text-fg/55 text-xs">{description}</span>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
