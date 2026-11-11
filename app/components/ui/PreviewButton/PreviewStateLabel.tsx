"use client";

import { useTranslation } from "react-i18next";

import type { PreviewStateLabelProps } from "./types";

export function PreviewStateLabel({ state }: PreviewStateLabelProps) {
  const { t } = useTranslation("components");

  return <>{state === "failed" ? t("preview.failedShort") : t("preview.noneShort")}</>;
}
