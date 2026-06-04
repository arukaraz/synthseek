"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";
import { cn } from "@utils/cn";
import type { SettingsSecretInputProps } from "./types";

export function SettingsSecretInput({
  value,
  onChange,
  placeholder,
  disabled,
  id,
  ariaLabel,
}: SettingsSecretInputProps) {
  const { t } = useTranslation("settings");
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={revealed ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setRevealed((p) => !p)}
        aria-label={revealed ? t("shell.secretInput.hide") : t("shell.secretInput.reveal")}
        className={cn(
          "text-fg/50 hover:text-fg/80 absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 transition-colors",
          "focus-visible:ring-primary-500/40 focus-visible:ring-2 focus-visible:outline-none"
        )}
      >
        {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
