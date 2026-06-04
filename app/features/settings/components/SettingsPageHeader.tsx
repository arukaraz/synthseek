"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";

import { backToSections, pageTitle } from "../styles";
import type { SettingsPageHeaderProps } from "./types";

export function SettingsPageHeader({ title, description }: SettingsPageHeaderProps) {
  const { t } = useTranslation("settings");
  return (
    <header className="mb-2 flex items-center gap-2">
      <Link href="/settings" aria-label={t("shell.pageHeader.backToSections")} className={backToSections()}>
        <ChevronLeft className="size-5" />
      </Link>
      <h1 className={pageTitle()}>{title}</h1>
      {description ? <InfoTooltip description={description} side="bottom" align="start" /> : null}
    </header>
  );
}
