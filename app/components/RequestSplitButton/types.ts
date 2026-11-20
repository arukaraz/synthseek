export type RequestSplitSize = "sm" | "md" | "lg" | "hero";

export type RequestSplitTone = "primary" | "ghost" | "outline";

export interface RequestSplitButtonProps {
  name: string;
  onRequest: () => void;
  onCustomize: () => void;
  label?: string;
  shortLabel?: string;
  count?: number;
  size?: RequestSplitSize;
  tone?: RequestSplitTone;
  fullWidth?: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
  className?: string;
  dataCy?: string;
}
