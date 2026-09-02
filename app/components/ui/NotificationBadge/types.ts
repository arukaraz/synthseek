import type { ReactNode } from "react";

export interface NotificationBadgeProps {
  visible: boolean;
  label: string;
  placement?: "corner" | "inline";
  children?: ReactNode;
}
