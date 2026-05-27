import type { ConfirmationVariant } from "@components/ui/ConfirmationModal";

export interface ConfirmOptions {
  title: string;
  message: string;
  variant?: ConfirmationVariant;
  confirmText?: string;
  cancelText?: string;
}
