"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { ScrollEdge } from "@components/FadeScroll";
import { useScrollEdges } from "@hooks/ui/useScrollEdges";

import { RAIL_SCROLL_STEP } from "./constants";
import { RecentScrobbleNode } from "./RecentScrobbleNode";
import { axisLine, rail, railWrap } from "./styles";
import type { RecentScrobblesRailProps } from "./types";

export function RecentScrobblesRail({ scrobbles }: RecentScrobblesRailProps) {
  const { t } = useTranslation("discover");
  const edges = useScrollEdges<HTMLDivElement>("x");
  const scroller = edges.node;

  const scrollByPage = useCallback(
    (direction: "left" | "right") => {
      if (!scroller) return;
      const first = scroller.firstElementChild;
      const nodeStep = first instanceof HTMLElement ? first.offsetWidth + 12 : scroller.clientWidth;
      const step = nodeStep * RAIL_SCROLL_STEP;
      scroller.scrollBy({ left: direction === "right" ? step : -step, behavior: "smooth" });
    },
    [scroller]
  );

  return (
    <div className={railWrap()}>
      <span className={axisLine()} aria-hidden />
      <div ref={edges.ref} className={rail()}>
        {scrobbles.map((s) => (
          <RecentScrobbleNode key={s.catalogTrackId} scrobble={s} />
        ))}
      </div>
      <ScrollEdge
        side="left"
        shade
        visible={edges.start}
        label={t("recentScrobbles.scrollLeftAriaLabel")}
        onClick={() => scrollByPage("left")}
      />
      <ScrollEdge
        side="right"
        shade
        visible={edges.end}
        label={t("recentScrobbles.scrollRightAriaLabel")}
        onClick={() => scrollByPage("right")}
      />
    </div>
  );
}
