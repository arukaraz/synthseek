"use client";

import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";

import { railScroller } from "../styles";
import { BLOCK_LIMITS } from "./constants";
import { blockBody, blockRail } from "./styles";
import type { WidgetBlockProps } from "./types";
import { WidgetCard } from "./WidgetCard";

export function RailBlock({ items, size, accent, controls }: WidgetBlockProps) {
  const { t } = useTranslation("discover");

  return (
    <div className={blockBody()}>
      <FadeScroll axis="x" arrows className={railScroller()} label={t("customWidget.rail")}>
        <div className={blockRail()}>
          {items.slice(0, BLOCK_LIMITS.rail[size]).map((item) => (
            <WidgetCard key={item.key} item={item} accent={accent} controls={controls(item)} />
          ))}
        </div>
      </FadeScroll>
    </div>
  );
}
