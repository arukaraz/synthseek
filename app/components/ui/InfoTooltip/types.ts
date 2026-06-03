export interface InfoTooltipProps {
  description: string;
  secondary?: string;
  title?: string;
  triggerLabel?: string;
  points?: string[];
  learnMore?: { label: string; href: string };
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  trigger?: "hover" | "click";
}
