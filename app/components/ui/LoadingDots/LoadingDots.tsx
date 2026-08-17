"use client";

import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import { loadingDots } from "./styles";
import type { LoadingDotsProps } from "./types";

export function LoadingDots({ size, className, label }: LoadingDotsProps) {
  const { t } = useTranslation("components");
  return (
    <span
      role="status"
      aria-label={label ?? t("loading.dots", { defaultValue: "Loading" })}
      className={cn(loadingDots({ size }), className)}
    >
      <span />
      <span />
      <span />
    </span>
  );
}
