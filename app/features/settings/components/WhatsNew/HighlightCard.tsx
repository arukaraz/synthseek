"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { InlineMarkdown } from "../PatchNotes";
import { HighlightVisual } from "./HighlightVisual";
import { card, cardBody, cardLink, cardLinkIcon, cardTitle } from "./styles";
import type { HighlightCardProps } from "./types";

export function HighlightCard({ highlight, mediaPath, onNavigate }: HighlightCardProps) {
  const { t } = useTranslation("settings");

  return (
    <article className={card()}>
      <HighlightVisual media={highlight.media} mediaPath={mediaPath} />
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
