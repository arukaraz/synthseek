"use client";

import type { LucideIcon } from "lucide-react";
import { statCard } from "../styles";

interface StatCardProps {
  value: number;
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
}

export function StatCard({ value, label, sublabel, icon: Icon }: StatCardProps) {
  return (
    <div className={statCard()}>
      {Icon && <Icon className="text-primary-400 mb-2 h-6 w-6" />}
      <span className="text-fg text-4xl font-bold">{value.toLocaleString()}</span>
      <span className="text-fg/80 text-sm font-medium">{label}</span>
      {sublabel && <span className="text-fg/50 text-xs">{sublabel}</span>}
    </div>
  );
}
