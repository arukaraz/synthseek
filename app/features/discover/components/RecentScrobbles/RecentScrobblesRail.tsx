"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useScrollEdges } from "@hooks/ui/useScrollEdges";

import { RAIL_SCROLL_STEP } from "./constants";
import { RecentScrobbleNode } from "./RecentScrobbleNode";
import { axisLine, rail, railEdge, railEdgeButton, railWrap } from "./styles";
import type { RecentScrobblesRailProps } from "./types";

export function RecentScrobblesRail({ scrobbles }: RecentScrobblesRailProps) {
  const { t } = useTranslation("discover");
  const edges = useScrollEdges<HTMLDivElement>("x");
  const canScrollLeft = edges.start;
  const canScrollRight = edges.end;
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
      <div className={railEdge({ side: "left", visible: canScrollLeft })}>
        <button
          type="button"
          onClick={() => scrollByPage("left")}
          className={railEdgeButton()}
          aria-label={t("recentScrobbles.scrollLeftAriaLabel")}
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>
      <div className={railEdge({ side: "right", visible: canScrollRight })}>
        <button
          type="button"
          onClick={() => scrollByPage("right")}
          className={railEdgeButton()}
          aria-label={t("recentScrobbles.scrollRightAriaLabel")}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
