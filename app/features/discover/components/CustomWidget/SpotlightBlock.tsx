"use client";

import { spotlightGrid } from "../ArtistSpotlight/styles";
import { CoverArt } from "../WidgetRow/CoverArt";
import { BLOCK_LIMITS } from "./constants";
import { CoverActionButton } from "./CoverActionButton";
import { itemMeta } from "./helpers";
import { blockBody, spotlightCopy, spotlightMeta, spotlightShade, spotlightTile, spotlightTitle } from "./styles";
import type { WidgetBlockProps } from "./types";

export function SpotlightBlock({ items, size, accent, controls }: WidgetBlockProps) {
  return (
    <div data-acc={accent} className={blockBody()}>
      <div className={spotlightGrid()}>
        {items.slice(0, BLOCK_LIMITS.spotlight[size]).map((item) => {
          const { onSelect, coverAction } = controls(item);
          const meta = itemMeta(item);
          return (
            <article key={item.key} className={spotlightTile()}>
              <CoverArt src={item.cover} seed={item.key} sizes="280px" />
              <span className={spotlightShade()} aria-hidden />
              <div className={spotlightCopy()}>
                {onSelect ? (
                  <button type="button" className={spotlightTitle({ interactive: true })} onClick={onSelect}>
                    {item.title}
                  </button>
                ) : (
                  <span className={spotlightTitle()}>{item.title}</span>
                )}
                {meta ? <span className={spotlightMeta()}>{meta}</span> : null}
              </div>
              {coverAction ? <CoverActionButton action={coverAction} /> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
