"use client";

import { useElementWidth } from "@hooks/ui/useElementWidth";

import { cardRowFit } from "../helpers";
import { cardRow, cardRowVars } from "../styles";
import { blockBody } from "./styles";
import type { WidgetBlockProps } from "./types";
import { WidgetCard } from "./WidgetCard";

export function CardsBlock({ items, size, accent, controls }: WidgetBlockProps) {
  const [bodyRef, width] = useElementWidth<HTMLDivElement>();
  const columns = cardRowFit(width, size);

  return (
    <div ref={bodyRef} className={blockBody()}>
      <div className={cardRow()} style={cardRowVars(columns)}>
        {items.slice(0, columns).map((item) => (
          <WidgetCard key={item.key} item={item} accent={accent} controls={controls(item)} />
        ))}
      </div>
    </div>
  );
}
