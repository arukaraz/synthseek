import type { QueuePresence } from "@components/ui/QueueAddButton";

export interface TrackCoverPlayProps {
  title: string;
  cover: string | null;
  presence: QueuePresence;
  onPlay?: () => Promise<unknown>;
  onTogglePlay?: () => void;
}
