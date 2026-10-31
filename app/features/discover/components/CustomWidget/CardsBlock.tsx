"use client";

import { cardRow, cardRowVars } from "../styles";
import { BLOCK_LIMITS, CARD_COLUMNS } from "./constants";
import { blockBody } from "./styles";
import type { WidgetBlockProps } from "./types";
import { WidgetCard } from "./WidgetCard";

export function CardsBlock({ items, size, accent, controls }: WidgetBlockProps) {
  const shown = items.slice(0, BLOCK_LIMITS.cards[size]);
  const single = shown.length === 1;

  return (
    <div className={blockBody()}>
      <div className={cardRow()} style={cardRowVars(Math.max(1, Math.min(CARD_COLUMNS[size], shown.length)))}>
        {shown.map((item) => (
          <WidgetCard
            key={item.key}
            item={item}
            accent={accent}
            controls={controls(item)}
            surface="framed"
            single={single}
          />
        ))}
      </div>
    </div>
  );
}
