import type { ReactNode } from "react";

export type ChainStatusTone = "success" | "muted" | "warning" | "danger";

export interface ChainStatus {
  tone: ChainStatusTone;
  label: string;
}

export interface ChainEntry<K extends string> {
  key: K;
  title: string;
  status: ChainStatus | null;
  mark?: ReactNode;
}

export interface OrderedChainProps<K extends string> {
  label: string;
  labelTrailing?: ReactNode;
  fixed?: readonly ChainEntry<K>[];
  entries: readonly ChainEntry<K>[];
  selected: string;
  onSelect: (key: K) => void;
  onReorder: (keys: K[]) => void;
  hint: string;
}

export interface ChainItemProps<K extends string> {
  entry: ChainEntry<K>;
  badge: ReactNode;
  selected: boolean;
  reorderable: boolean;
  onSelect: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export interface ChainPanelProps {
  children: ReactNode;
  label: string;
}
