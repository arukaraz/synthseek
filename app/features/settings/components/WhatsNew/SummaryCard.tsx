"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { EntryBody } from "../PatchNotes";
import { FULL_CHANGELOG_HREF } from "./constants";
import { card, cardLink, cardLinkIcon, cardTitle } from "./styles";
import type { SummaryCardProps } from "./types";

export function SummaryCard({ entry, hasHighlights, onNavigate }: SummaryCardProps) {
  const { t } = useTranslation("settings");

  return (
    <article className={card()}>
      <h3 className={cardTitle()}>{hasHighlights ? t("updates.whatsNew.summaryTitle") : entry.title}</h3>
      <EntryBody entry={entry} />
      <Link href={FULL_CHANGELOG_HREF} onClick={onNavigate} className={cardLink()}>
        {t("updates.whatsNew.fullChangelog")}
        <ArrowRight className={cardLinkIcon()} />
      </Link>
    </article>
  );
}
