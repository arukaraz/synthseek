"use client";

import { FadeScroll } from "@components/FadeScroll";

import { WidgetRow } from "../WidgetRow/WidgetRow";
import { BLOCK_LIMITS } from "./constants";
import { calendarPartsOf } from "./helpers";
import { blockBody, blockList, calendarDate, calendarDay, calendarMonth } from "./styles";
import type { WidgetBlockProps } from "./types";

export function CalendarBlock({ items, size, accent, controls }: WidgetBlockProps) {
  return (
    <div data-acc={accent} className={blockBody()}>
      <FadeScroll>
        <ul className={blockList()}>
          {items.slice(0, BLOCK_LIMITS.calendar[size]).map((item) => {
            const parts = calendarPartsOf(item.date);
            return (
              <WidgetRow
                key={item.key}
                cover={item.cover}
                seed={item.key}
                title={item.title}
                subtitle={item.subtitle}
                trailing={
                  parts ? (
                    <span className={calendarDate()}>
                      <span className={calendarMonth()}>{parts.month}</span>
                      <span className={calendarDay()}>{parts.day}</span>
                    </span>
                  ) : undefined
                }
                {...controls(item)}
              />
            );
          })}
        </ul>
      </FadeScroll>
    </div>
  );
}
