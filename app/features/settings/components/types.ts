import type { VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import type { pill } from "../styles";

export interface ChipsInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface EngineRowProps {
  label: string;
  labelTrailing?: ReactNode;
  description: string;
  control: ReactNode;
  anchor?: string;
}

export interface IntegrationTabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface IntegrationTabsProps {
  items: ReadonlyArray<IntegrationTabItem>;
}

export interface ListManagerProps {
  value: string[];
  onChange: (next: string[]) => void;
  addPlaceholder?: string;
  filterPlaceholder?: string;
  emptyLabel?: string;
  countLabel?: (count: number) => string;
  helper?: ReactNode;
  disabled?: boolean;
}

export interface PillProps extends VariantProps<typeof pill> {
  children: ReactNode;
}

export interface ResetDefaultsButtonProps {
  onReset: () => void;
  disabled?: boolean;
}

export interface SaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  saveDisabled?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (next: T) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface SettingsCardProps {
  title: string;
  optional?: boolean;
  description?: string;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
}

export interface SettingsFieldProps {
  label: string;
  htmlFor?: string;
  helper?: ReactNode;
  className?: string;
  children: ReactNode;
}

export interface SettingsNumberInputProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export interface SettingsPageHeaderProps {
  title: string;
  description?: string;
}

export interface SettingsPagePlaceholderProps {
  title: string;
  message?: string;
}

export interface SettingsSecretInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export interface SettingsTextInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "email" | "url";
  id?: string;
  ariaLabel?: string;
}

export type ChipsKeyboardEvent = KeyboardEvent<HTMLInputElement>;
