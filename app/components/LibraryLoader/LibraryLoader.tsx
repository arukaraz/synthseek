"use client";

import { useTranslation } from "react-i18next";

import { BrandedLoader } from "@components/ui/BrandedLoader";

export function LibraryLoader() {
  const { t } = useTranslation("appShell");
  return <BrandedLoader label={t("appShell.loader.library")} />;
}
