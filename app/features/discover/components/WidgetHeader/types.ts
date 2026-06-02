import type { LucideIcon } from "lucide-react";

export type WidgetHeaderHeadingLevel = "h2" | "h3";

export interface WidgetHeaderAction {
  label: string;
  ariaLabel?: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
}

export interface WidgetHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  headingLevel?: WidgetHeaderHeadingLevel;
  action?: WidgetHeaderAction;
  titleId?: string;
}

export interface WidgetHeaderActionLinkProps {
  action: WidgetHeaderAction;
}
