"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { authEyeToggle, authFieldLabel, authInputControl, authInputIcon, authInputRow } from "../styles";
import type { PasswordFieldProps } from "./types";

export function PasswordField({
  id,
  value,
  onChange,
  invalid = false,
  label,
  placeholder = "••••••••",
  autoComplete = "current-password",
  minLength,
  describedBy,
}: PasswordFieldProps) {
  const { t } = useTranslation("components");
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={authFieldLabel()}>
        {label ?? t("passwordField.label")}
      </label>
      <div className={authInputRow({ invalid })}>
        <Lock className={authInputIcon()} aria-hidden="true" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={authInputControl()}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? t("passwordField.hide") : t("passwordField.show")}
          aria-pressed={visible}
          className={authEyeToggle()}
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
