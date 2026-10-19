import type { ResumePoint } from "@hooks/ui/player";

export interface ResumeCardProps {
  point: ResumePoint;
  onToggle: () => void;
}
