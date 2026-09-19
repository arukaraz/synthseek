export interface QueueAddButtonProps {
  onAdd: () => Promise<boolean>;
  label: string;
  confirmedLabel: string;
  inQueue?: boolean;
  revealOnHover?: boolean;
  className?: string;
}
