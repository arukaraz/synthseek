"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSwipe } from "@hooks/ui/useSwipe";

import type { WidgetBlockProps } from "../CustomWidget/types";
import { CoverArt } from "../WidgetRow/CoverArt";
import { STORY_BACKDROP_COVERS, STORY_ROWS, STORY_SHOWS_COVER, STORY_SHOWS_DOTS } from "./constants";
import { storyIndexOf } from "./helpers";
import {
  storyArrow,
  storyBackdrop,
  storyBackdropTile,
  storyBody,
  storyCopy,
  storyCounter,
  storyCover,
  storyDetail,
  storyDot,
  storyDots,
  storyFrame,
  storyHeadline,
  storyLabel,
  storyNav,
  storyRow,
  storyRowLabel,
  storyRowValue,
  storyRows,
  storyTint,
} from "./styles";

export function StoryBlock({ pages, covers, size, accent }: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const [position, setPosition] = useState(0);
  const total = pages.length;
  const index = storyIndexOf(position, total);
  const go = (next: number) => setPosition(storyIndexOf(next, total));
  const swipe = useSwipe({ onSwipeLeft: () => go(index + 1), onSwipeRight: () => go(index - 1) });
  const current = pages[index];
  if (!current) return null;
  const rows = current.rows.slice(0, STORY_ROWS[size]);
  const showCover = STORY_SHOWS_COVER[size] && current.cover !== null;

  return (
    <div
      data-acc={accent}
      className={storyFrame()}
      role="group"
      aria-roledescription={t("customWidget.story.role")}
      aria-label={t("customWidget.story.position", { current: index + 1, total })}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(index + 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(index - 1);
        }
      }}
      onTouchStart={swipe.onTouchStart}
      onTouchMove={swipe.onTouchMove}
      onTouchEnd={swipe.onTouchEnd}
    >
      <div className={storyBackdrop()} aria-hidden>
        {covers.slice(0, STORY_BACKDROP_COVERS).map((cover) => (
          <div key={cover} className={storyBackdropTile()}>
            <CoverArt src={cover} seed={cover} sizes="96px" />
          </div>
        ))}
      </div>
      <div className={storyTint()} aria-hidden />
      <div className={storyBody()} aria-live="polite">
        <div className={storyCopy()}>
          <span className={storyLabel()}>{current.label}</span>
          <span className={storyHeadline({ size })}>{current.headline}</span>
          {current.detail ? <span className={storyDetail()}>{current.detail}</span> : null}
          {rows.length > 0 ? (
            <ol className={storyRows()}>
              {rows.map((row) => (
                <li key={row.key} className={storyRow()}>
                  <span className={storyRowLabel()}>{row.label}</span>
                  <span className={storyRowValue()}>{row.value}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
        {showCover ? (
          <div className={storyCover()}>
            <CoverArt src={current.cover} seed={current.key} sizes="160px" />
          </div>
        ) : null}
      </div>
      {total > 1 ? (
        <div className={storyNav()}>
          <button
            type="button"
            className={storyArrow()}
            aria-label={t("customWidget.story.previous")}
            onClick={() => go(index - 1)}
          >
            <ChevronLeft />
          </button>
          {STORY_SHOWS_DOTS[size] ? (
            <div className={storyDots()}>
              {pages.map((entry, dot) => (
                <button
                  key={entry.key}
                  type="button"
                  className={storyDot({ active: dot === index })}
                  aria-label={t("customWidget.story.goTo", { page: entry.label })}
                  aria-current={dot === index ? "step" : undefined}
                  onClick={() => go(dot)}
                />
              ))}
            </div>
          ) : (
            <span className={storyCounter()}>{t("customWidget.story.counter", { current: index + 1, total })}</span>
          )}
          <button
            type="button"
            className={storyArrow()}
            aria-label={t("customWidget.story.next")}
            onClick={() => go(index + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      ) : null}
    </div>
  );
}
