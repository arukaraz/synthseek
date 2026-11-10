import type { PendingConfirmation } from "../../hooks/types";

export interface DirectRequestConfirmProps {
  pending: PendingConfirmation | null;
  onConfirm: () => void;
  onCancel: () => void;
}
