import type { ReactNode } from "react";

export interface ModalAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface ModalActionBarProps {
  start?: ReactNode;
  choice?: ReactNode;
  cancel: ModalAction;
  save: ModalAction;
}

export interface ModalChoiceProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
