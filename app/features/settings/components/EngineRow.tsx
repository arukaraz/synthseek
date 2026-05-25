"use client";

import type { ReactNode } from "react";

import { engineRow } from "../styles";

interface EngineRowProps {
  label: string;
  description: string;
  control: ReactNode;
}

export function EngineRow({ label, description, control }: EngineRowProps) {
  return (
    <div className={engineRow()}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-fg text-sm font-medium">{label}</span>
        <span className="text-fg/55 text-xs">{description}</span>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
