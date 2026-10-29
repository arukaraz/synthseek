"use client";

import { FadeScroll } from "@components/FadeScroll";

import { WidgetRow } from "../WidgetRow/WidgetRow";
import { BLOCK_LIMITS } from "./constants";
import { blockBody, blockList, blockValue } from "./styles";
import type { WidgetBlockProps } from "./types";

export function ListBlock({ items, size, accent, controls }: WidgetBlockProps) {
  return (
    <div data-acc={accent} className={blockBody()}>
      <FadeScroll>
        <ol className={blockList({ wide: size === "L" })}>
          {items.slice(0, BLOCK_LIMITS.list[size]).map((item, index) => (
            <WidgetRow
              key={item.key}
              cover={item.cover}
              seed={item.key}
              title={item.title}
              subtitle={item.subtitle}
              lead={index + 1}
              trailing={item.value ? <span className={blockValue()}>{item.value}</span> : undefined}
              {...controls(item)}
            />
          ))}
        </ol>
      </FadeScroll>
    </div>
  );
}
