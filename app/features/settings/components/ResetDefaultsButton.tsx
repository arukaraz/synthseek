"use client";

import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import type { ResetDefaultsButtonProps } from "./types";

export function ResetDefaultsButton({ onReset, disabled }: ResetDefaultsButtonProps) {
  const { t } = useTranslation("settings");
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onReset}
      disabled={disabled}
      aria-label={t("shell.resetDefaults.label")}
      className="text-fg/55 hover:text-fg h-7 px-2 text-xs"
    >
      <RotateCcw className="size-3.5" />
      {t("shell.resetDefaults.label")}
    </Button>
  );
}
