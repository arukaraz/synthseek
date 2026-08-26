"use client";

import { Input } from "@components/ui/Input";
import type { SettingsTextInputProps } from "./types";

export function SettingsTextInput({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
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
      readOnly={readOnly}
      aria-label={ariaLabel}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
