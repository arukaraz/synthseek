import type { BadgeSource } from "@components/SourceBadge";

import type { StatItem } from "../../types";

export type FigureKind = "listeners" | "plays";

export interface FigureEntry {
  source: BadgeSource;
  name: string;
  value: number;
  fans: boolean;
}

export interface FigureGroup {
  kind: FigureKind;
  entries: FigureEntry[];
}

export interface ListeningFigures {
  listeners: number | null;
  plays: number | null;
}

export interface FigureSources {
  lastfm: ListeningFigures | null | undefined;
  listenbrainz: ListeningFigures | null | undefined;
  catalogFans: { provider: string; fans: number } | null | undefined;
}

export interface SourceFiguresProps {
  groups: FigureGroup[];
  plain: StatItem;
}

export interface SourceFigureProps {
  group: FigureGroup;
  lead: FigureEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
