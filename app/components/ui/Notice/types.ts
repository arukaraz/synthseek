import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type NoticeVariant = "info" | "warning" | "danger" | "success";

export interface NoticeProps {
  variant?: NoticeVariant;
  title: string;
  icon?: LucideIcon;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  children?: ReactNode;
}
