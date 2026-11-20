import type { QueuePresence } from "@components/ui/QueueAddButton";
import type { ReactNode } from "react";

export interface TrackCoverPlayProps {
  title: string;
  cover: string | null;
  presence: QueuePresence;
  onPlay?: () => Promise<unknown>;
  onTogglePlay?: () => void;
  overlay?: ReactNode;
}
