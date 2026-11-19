"use client";

import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";

import { WidgetRow } from "../WidgetRow/WidgetRow";
import { BLOCK_LIMITS } from "./constants";
import { FollowItemMore } from "./FollowItemMore";
import { calendarPartsOf, todayBoundaryIndex } from "./helpers";
import { blockBody, blockList, calendarDate, calendarDay, calendarMonth, followToday } from "./styles";
import type { WidgetBlockProps } from "./types";

export function CalendarBlock({ items, size, accent, controls }: WidgetBlockProps) {
  const { t } = useTranslation("follows");
  const shown = items.slice(0, BLOCK_LIMITS.calendar[size]);
  const boundary = todayBoundaryIndex(shown);

  return (
    <div data-acc={accent} className={blockBody()}>
      <FadeScroll>
        <ul className={blockList()}>
          {shown.map((item, index) => {
            const parts = calendarPartsOf(item.date);
            return (
              <Fragment key={item.key}>
                {index === boundary ? (
                  <li role="separator" className={followToday()}>
                    {t("widget.today")}
                  </li>
                ) : null}
                <WidgetRow
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
                  more={item.follow ? <FollowItemMore item={item} /> : undefined}
                  {...controls(item)}
                />
              </Fragment>
            );
          })}
        </ul>
      </FadeScroll>
    </div>
  );
}
