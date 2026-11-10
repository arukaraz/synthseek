import type { ReactNode } from "react";

export type WidgetListColumns = "one" | "two";

export interface CoverArtProps {
  src: string | null;
  seed: string;
  sizes: string;
}

export type WidgetRowCoverAction =
  | { kind: "play"; label: string; onClick: () => void }
  | { kind: "request"; name: string; onClick: () => void; onCustomize: () => void };

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
