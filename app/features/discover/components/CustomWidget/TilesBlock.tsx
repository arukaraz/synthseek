"use client";

import { cn } from "@utils/cn";

import { CATEGORIES_LIMIT } from "../CategoriesGrid/constants";
import { getCardSize, mosaicLayoutFor } from "../CategoriesGrid/helpers";
import { mosaicGrid, sizeClasses } from "../CategoriesGrid/styles";
import { CoverArt } from "../WidgetRow/CoverArt";
import { CoverActionButton } from "./CoverActionButton";
import { blockBody, tileCard, tileCopy, tileName, tileShade, tileValue } from "./styles";
import type { WidgetBlockProps } from "./types";

export function TilesBlock({ items, size, accent, controls }: WidgetBlockProps) {
  const layout = mosaicLayoutFor(size);

  return (
    <div data-acc={accent} className={blockBody()}>
      <div className={mosaicGrid({ layout })}>
        {items.slice(0, CATEGORIES_LIMIT).map((item, index) => {
          const { onSelect, coverAction } = controls(item);
          const tile = getCardSize(index, layout);
          return (
            <article key={item.key} className={cn(tileCard(), sizeClasses[tile])}>
              <CoverArt src={item.cover} seed={item.key} sizes="280px" />
              <span className={tileShade()} aria-hidden />
              <div className={tileCopy()}>
                {onSelect ? (
                  <button type="button" className={tileName({ size: tile, interactive: true })} onClick={onSelect}>
                    {item.title}
                  </button>
                ) : (
                  <span className={tileName({ size: tile })}>{item.title}</span>
                )}
                {item.value ? <span className={tileValue()}>{item.value}</span> : null}
              </div>
              {coverAction ? <CoverActionButton action={coverAction} /> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
