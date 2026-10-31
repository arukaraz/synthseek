"use client";

import { cardRowLimit } from "../helpers";
import { PlaySetCard } from "../PlaySetCard/PlaySetCard";
import { cardRowVars } from "../styles";
import { SET_POSTER_COLUMNS, SET_POSTER_LIMITS } from "./constants";
import { blockBody, postersGrid } from "./styles";
import type { WidgetBlockProps } from "./types";

export function PostersBlock({ items, size, accent, controls, heading }: WidgetBlockProps) {
  const lists = items.some((item) => item.listSlot !== undefined);
  const columns = Math.max(1, Math.min(lists ? SET_POSTER_COLUMNS[size] : cardRowLimit(size), items.length));
  const shown = items.slice(0, lists ? SET_POSTER_LIMITS[size] : columns);

  return (
    <div className={blockBody()}>
      <div className={postersGrid()} style={cardRowVars(columns)}>
        {shown.map((item) => {
          const { onSelect, coverAction } = controls(item);
          return (
            <PlaySetCard
              key={item.key}
              accent={accent}
              icon={heading.icon}
              tag={item.subtitle}
              title={item.title}
              blurb={null}
              footnote={item.value}
              pinned={item.pinned}
              covers={item.covers ?? (item.cover ? [item.cover] : [])}
              seed={item.key}
              playLabel={coverAction?.label ?? item.title}
              onPlay={coverAction?.onClick ?? null}
              actionKind={coverAction?.kind}
              onOpen={onSelect}
              revealAction
            />
          );
        })}
      </div>
    </div>
  );
}
