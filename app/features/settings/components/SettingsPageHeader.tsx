"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { InfoTooltip } from "@components/ui/InfoTooltip";

import { backToSections, pageTitle } from "../styles";
import type { SettingsPageHeaderProps } from "./types";

export function SettingsPageHeader({ title, description }: SettingsPageHeaderProps) {
  return (
    <header className="mb-2 flex items-center gap-2">
      <Link href="/settings" aria-label="Back to sections" className={backToSections()}>
        <ChevronLeft className="size-5" />
      </Link>
      <h1 className={pageTitle()}>{title}</h1>
      {description ? <InfoTooltip description={description} side="bottom" align="start" /> : null}
    </header>
  );
}
