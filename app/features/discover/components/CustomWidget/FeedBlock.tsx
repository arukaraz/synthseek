"use client";

import { FadeScroll } from "@components/FadeScroll";

import { BLOCK_LIMITS } from "./constants";
import { itemMeta } from "./helpers";
import { blockBody, feedItem, feedList, feedMeta, feedTitle } from "./styles";
import type { WidgetBlockProps } from "./types";

export function FeedBlock({ items, size, accent, controls }: WidgetBlockProps) {
  return (
    <div data-acc={accent} className={blockBody()}>
      <FadeScroll>
        <ul className={feedList()}>
          {items.slice(0, BLOCK_LIMITS.feed[size]).map((item) => {
            const { onSelect } = controls(item);
            const meta = itemMeta(item);
            return (
              <li key={item.key} className={feedItem()}>
                {onSelect ? (
                  <button type="button" className={feedTitle({ interactive: true })} onClick={onSelect}>
                    {item.title}
                  </button>
                ) : (
                  <span className={feedTitle()}>{item.title}</span>
                )}
                {meta ? <span className={feedMeta()}>{meta}</span> : null}
              </li>
            );
          })}
        </ul>
      </FadeScroll>
    </div>
  );
}
