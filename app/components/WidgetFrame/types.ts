import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { WidgetHeaderAction } from "@components/WidgetHeader/types";

export interface WidgetFrameProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  info: string;
  titleId: string;
  loading: boolean;
  note: string | null;
  action?: WidgetHeaderAction;
  aside?: ReactNode;
  compactOnPhone?: boolean;
  children: ReactNode;
}
