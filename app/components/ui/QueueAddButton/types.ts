export interface QueueAddButtonProps {
  onAdd: () => Promise<boolean>;
  label: string;
  confirmedLabel: string;
  revealOnHover?: boolean;
  className?: string;
}
