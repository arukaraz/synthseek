"use client";

import { Input } from "@components/ui/Input";
import { useSettingsFieldLabelId } from "../hooks/useSettingsFieldLabel";
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
  autoComplete,
}: SettingsTextInputProps) {
  const fieldLabelId = useSettingsFieldLabelId();

  return (
    <Input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel === undefined ? (fieldLabelId ?? undefined) : undefined}
      autoComplete={autoComplete ?? (type === "url" ? "off" : undefined)}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
