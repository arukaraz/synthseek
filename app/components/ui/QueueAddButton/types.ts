export type QueuePresence = "absent" | "upcoming" | "playing" | "paused";

export interface QueueAddButtonProps {
  title: string;
  presence: QueuePresence;
  onAdd: () => Promise<boolean>;
  onRemove: () => void;
  revealOnHover?: boolean;
  className?: string;
}
