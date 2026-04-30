"use client";

import { cn } from "@utils/cn";
import { detailStatCard } from "./styles";
import type { RequestDetailStatsCardProps } from "./types";

export function RequestDetailStatsCard({ label, value, sublabel, valueClassName }: RequestDetailStatsCardProps) {
  return (
    <div className={detailStatCard()}>
      <span className="text-fg/40 text-[10px] font-semibold tracking-wider uppercase">{label}</span>
      <span className={cn("text-fg text-2xl font-bold sm:text-3xl", valueClassName)}>{value}</span>
      {sublabel && <span className="text-fg/40 text-xs">{sublabel}</span>}
    </div>
  );
}
