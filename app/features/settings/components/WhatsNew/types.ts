import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type WhatsNewEntry = NonNullable<RouterOutputs["updates"]["whatsNew"]["entry"]>;
export type WhatsNewHighlight = NonNullable<WhatsNewEntry["highlights"]>[number];
export type WhatsNewMedia = NonNullable<WhatsNewHighlight["media"]>;

export interface WhatsNewDialogProps {
  entry: WhatsNewEntry;
  mediaPath: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface HighlightCardProps {
  highlight: WhatsNewHighlight;
  mediaPath: string | null;
  onNavigate: () => void;
}

export interface HighlightMediaProps {
  media: WhatsNewMedia;
  mediaPath: string;
}

export interface HighlightVisualProps {
  media: WhatsNewMedia | undefined;
  mediaPath: string | null;
}

export interface SummaryCardProps {
  entry: WhatsNewEntry;
  hasHighlights: boolean;
  onNavigate: () => void;
}

export interface CardProgressProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}

export type SegmentState = "done" | "current" | "todo";
