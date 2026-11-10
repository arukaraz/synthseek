import type { LucideIcon } from "lucide-react";

import type { RequestCoverAction } from "../CustomWidget/types";

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
  requestAction?: RequestCoverAction;
  onOpen?: () => void;
  revealAction?: boolean;
  pinned?: boolean;
}
