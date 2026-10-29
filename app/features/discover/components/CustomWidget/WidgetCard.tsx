"use client";

import { Download, Play } from "lucide-react";

import { CoverArt } from "../WidgetRow/CoverArt";
import { card, cardAction, cardCopy, cardCover, cardFoot, cardSubtitle, cardTitle } from "./styles";
import type { WidgetCardProps } from "./types";

export function WidgetCard({ item, accent, controls: { onSelect, coverAction } }: WidgetCardProps) {
  return (
    <article data-acc={accent} className={card()}>
      <span className={cardCover()}>
        <CoverArt src={item.cover} seed={item.key} sizes="200px" />
        {coverAction ? (
          <button type="button" className={cardAction()} aria-label={coverAction.label} onClick={coverAction.onClick}>
            {coverAction.kind === "play" ? <Play /> : <Download />}
          </button>
        ) : null}
      </span>
      <span className={cardCopy()}>
        {onSelect ? (
          <button type="button" className={cardTitle({ interactive: true })} onClick={onSelect}>
            {item.title}
          </button>
        ) : (
          <span className={cardTitle()}>{item.title}</span>
        )}
        {item.subtitle ? <span className={cardSubtitle()}>{item.subtitle}</span> : null}
        {item.value ? <span className={cardFoot()}>{item.value}</span> : null}
      </span>
    </article>
  );
}
