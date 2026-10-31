"use client";

import { CoverArt } from "../WidgetRow/CoverArt";
import { CoverActionButton } from "./CoverActionButton";
import { card, cardCopy, cardCover, cardFoot, cardSubtitle, cardTitle } from "./styles";
import type { WidgetCardProps } from "./types";

export function WidgetCard({
  item,
  accent,
  surface,
  single = false,
  controls: { onSelect, coverAction },
}: WidgetCardProps) {
  return (
    <article data-acc={accent} className={card({ surface, single })}>
      <span className={cardCover({ surface, single })}>
        <CoverArt src={item.cover} seed={item.key} sizes={single ? "400px" : "200px"} />
        {coverAction ? <CoverActionButton action={coverAction} /> : null}
      </span>
      <span className={cardCopy({ surface, single })}>
        {onSelect ? (
          <button type="button" className={cardTitle({ interactive: true, single })} onClick={onSelect}>
            {item.title}
          </button>
        ) : (
          <span className={cardTitle({ single })}>{item.title}</span>
        )}
        {item.subtitle ? <span className={cardSubtitle({ single })}>{item.subtitle}</span> : null}
        {item.value ? <span className={cardFoot()}>{item.value}</span> : null}
      </span>
    </article>
  );
}
