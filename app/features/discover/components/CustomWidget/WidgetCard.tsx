"use client";

import { CoverArt } from "../WidgetRow/CoverArt";
import { CoverActionButton } from "./CoverActionButton";
import { FollowItemMore } from "./FollowItemMore";
import { card, cardCopy, cardCover, cardFoot, cardMore, cardSubtitle, cardTitle } from "./styles";
import type { WidgetCardProps } from "./types";

export function WidgetCard({
  item,
  accent,
  surface,
  single = false,
  controls: { onSelect, coverAction },
}: WidgetCardProps) {
  return (
    <article data-part="media-tile" data-acc={accent} className={card({ surface, single })}>
      <span className={cardCover({ surface, single })}>
        <CoverArt src={item.cover} seed={item.key} sizes={single ? "400px" : "200px"} />
        {coverAction ? <CoverActionButton action={coverAction} /> : null}
        {item.follow ? (
          <span className={cardMore()}>
            <FollowItemMore item={item} />
          </span>
        ) : null}
      </span>
      <span className={cardCopy({ surface, single })}>
        {onSelect ? (
          <button
            type="button"
            data-part="media-tile-title"
            className={cardTitle({ interactive: true, single })}
            onClick={onSelect}
          >
            {item.title}
          </button>
        ) : (
          <span data-part="media-tile-title" className={cardTitle({ single })}>
            {item.title}
          </span>
        )}
        {item.subtitle ? <span className={cardSubtitle({ single })}>{item.subtitle}</span> : null}
        {item.value ? <span className={cardFoot()}>{item.value}</span> : null}
      </span>
    </article>
  );
}
