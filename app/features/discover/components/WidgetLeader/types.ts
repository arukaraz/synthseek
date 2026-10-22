import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface WidgetLeaderBadge {
  icon: LucideIcon;
  label: string;
}

export interface WidgetLeaderProps {
  cover: string | null;
  seed: string;
  badge: WidgetLeaderBadge;
  children: ReactNode;
}
