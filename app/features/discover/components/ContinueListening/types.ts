import type { ResumePoint } from "@hooks/ui/player";

export interface ResumeLeaderProps {
  point: ResumePoint;
  fill: boolean;
  onToggle: () => void;
}
