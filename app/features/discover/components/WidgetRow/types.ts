import type { ReactNode } from "react";

export type WidgetListColumns = "one" | "two";

export interface CoverArtProps {
  src: string | null;
  seed: string;
  sizes: string;
}

export interface WidgetRowCoverAction {
  kind: "play" | "request";
  label: string;
  onClick: () => void;
}

export interface WidgetRowProps {
  cover: string | null;
  seed: string;
  title: string;
  subtitle: string;
  lead?: ReactNode;
  trailing?: ReactNode;
  onSelect?: () => void;
  coverAction?: WidgetRowCoverAction;
}
