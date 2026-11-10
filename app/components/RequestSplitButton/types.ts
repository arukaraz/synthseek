export type RequestSplitSize = "sm" | "md" | "lg";

export type RequestSplitTone = "primary" | "ghost";

export interface RequestSplitButtonProps {
  name: string;
  onRequest: () => void;
  onCustomize: () => void;
  label?: string;
  size?: RequestSplitSize;
  tone?: RequestSplitTone;
  fullWidth?: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
  className?: string;
  dataCy?: string;
}
