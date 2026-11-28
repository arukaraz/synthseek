export interface ProgressBarProps {
  progress: number;
  isActive?: boolean;
  gradient?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}
