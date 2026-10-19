import type { LucideIcon } from "lucide-react";

export type PlaySetAccent = "daily" | "weekly" | "explore" | "cf";

export interface PlaySetCardProps {
  accent: PlaySetAccent;
  icon: LucideIcon;
  tag: string;
  title: string;
  blurb: string | null;
  footnote: string | null;
  covers: readonly string[];
  seed: string;
  info?: string;
  playLabel: string;
  onPlay: (() => void) | null;
}
