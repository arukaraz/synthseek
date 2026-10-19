import type { ReactNode } from "react";

export interface CoverArtProps {
  src: string | null;
  seed: string;
  sizes: string;
}

export interface WidgetRowProps {
  cover: string | null;
  seed: string;
  title: string;
  subtitle: string;
  lead?: ReactNode;
  trailing?: ReactNode;
  round?: boolean;
  onSelect?: () => void;
}
