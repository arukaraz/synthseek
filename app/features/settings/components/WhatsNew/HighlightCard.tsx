"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { InlineMarkdown } from "../PatchNotes";
import { card, cardBody, cardLink, cardLinkIcon, cardTitle, visual, visualIcon } from "./styles";
import type { HighlightCardProps } from "./types";

export function HighlightCard({ highlight, onNavigate }: HighlightCardProps) {
  const { t } = useTranslation("settings");

  return (
    <article className={card()}>
      <div className={visual()} aria-hidden>
        <Sparkles className={visualIcon()} />
      </div>
      <h3 className={cardTitle()}>{highlight.title}</h3>
      <p className={cardBody()}>
        <InlineMarkdown text={highlight.body} />
      </p>
      {highlight.link ? (
        <Link href={highlight.link} onClick={onNavigate} className={cardLink()}>
          {t("updates.whatsNew.tryIt")}
          <ArrowRight className={cardLinkIcon()} />
        </Link>
      ) : null}
    </article>
  );
}
