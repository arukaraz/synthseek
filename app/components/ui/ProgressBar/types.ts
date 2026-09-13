export interface ProgressBarProps {
  progress: number;
  isActive?: boolean;
  gradient?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}
