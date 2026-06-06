"use client";

import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import { spinnerRing } from "./styles";
import type { SpinnerProps } from "./types";

export function Spinner({ size, className, label, decorative = false }: SpinnerProps) {
  const { t } = useTranslation("components");

  if (decorative) {
    return <span aria-hidden="true" className={cn(spinnerRing({ size }), className)} />;
  }

  return (
    <span role="status" aria-live="polite" aria-busy="true">
      <span aria-hidden="true" className={cn(spinnerRing({ size }), className)} />
      <span className="sr-only">{label ?? t("loading.spinner")}</span>
    </span>
  );
}
