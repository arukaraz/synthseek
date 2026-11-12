"use client";

import { engineRow } from "../styles";
import type { EngineRowProps } from "./types";

export function EngineRow({ label, labelTrailing, description, control, anchor }: EngineRowProps) {
  return (
    <div className={engineRow()} data-anchor-target={anchor}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-fg text-sm font-medium">{label}</span>
          {labelTrailing}
        </div>
        {description ? <span className="text-fg/55 text-xs">{description}</span> : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
