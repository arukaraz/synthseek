"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";
import { cn } from "@utils/cn";
import { SECRET_SENTINEL } from "./constants";
import type { SettingsSecretInputProps } from "./types";

export function SettingsSecretInput({
  value,
  onChange,
  source,
  placeholder,
  disabled,
  id,
  ariaLabel,
  autoComplete,
}: SettingsSecretInputProps) {
  const { t } = useTranslation("settings");
  const [revealed, setRevealed] = useState(false);
  const [stored, setStored] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const holdsStoredValue = value === SECRET_SENTINEL;
  const shown = revealed && holdsStoredValue && stored !== null ? stored : value;

  const toggle = async (): Promise<void> => {
    if (revealed) {
      setRevealed(false);
      setStored(null);
      return;
    }
    if (holdsStoredValue && source.kind === "stored") {
      setPending(true);
      try {
        setStored(await source.reveal());
        setRevealed(true);
      } catch {
        setStored(null);
      } finally {
        setPending(false);
      }
      return;
    }
    setRevealed(true);
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type={revealed ? "text" : "password"}
        value={shown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        autoComplete={autoComplete}
        onChange={(e) => {
          setStored(null);
          onChange(e.target.value);
        }}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={pending}
        aria-busy={pending || undefined}
        aria-label={revealed ? t("shell.secretInput.hide") : t("shell.secretInput.reveal")}
        className={cn(
          "text-fg/50 hover:text-fg/80 absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 transition-colors",
          "focus-visible:ring-primary-500/40 focus-visible:ring-2 focus-visible:outline-none"
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : revealed ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
