"use client";

import { Input } from "@components/ui/Input";

interface SettingsTextInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "email" | "url";
  id?: string;
  ariaLabel?: string;
}

export function SettingsTextInput({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  id,
  ariaLabel,
}: SettingsTextInputProps) {
  return (
    <Input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
