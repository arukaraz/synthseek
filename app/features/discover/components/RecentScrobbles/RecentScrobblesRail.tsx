"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { RecentScrobbleNode } from "./RecentScrobbleNode";
import { axisLine, rail, railEdge, railEdgeButton, railWrap } from "./styles";
import type { RecentScrobblesRailProps } from "./types";

export function RecentScrobblesRail({ candidates }: RecentScrobblesRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateAffordances = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateAffordances();
    el.addEventListener("scroll", updateAffordances, { passive: true });
    const observer = new ResizeObserver(updateAffordances);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => {
      el.removeEventListener("scroll", updateAffordances);
      observer.disconnect();
    };
  }, [updateAffordances, candidates.length]);

  const scrollByOne = useCallback((direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const step = first instanceof HTMLElement ? first.offsetWidth + 12 : el.clientWidth;
    el.scrollBy({ left: direction === "right" ? step : -step, behavior: "smooth" });
  }, []);

  return (
    <div className={railWrap()}>
      <span className={axisLine()} aria-hidden />
      <div ref={scrollerRef} className={rail()}>
        {candidates.map((c) => (
          <RecentScrobbleNode key={c.catalogTrackId} candidate={c} />
        ))}
      </div>
      <div className={railEdge({ side: "left", visible: canScrollLeft })}>
        <button type="button" onClick={() => scrollByOne("left")} className={railEdgeButton()} aria-label="Scroll left">
          <ChevronLeft className="size-4" />
        </button>
      </div>
      <div className={railEdge({ side: "right", visible: canScrollRight })}>
        <button
          type="button"
          onClick={() => scrollByOne("right")}
          className={railEdgeButton()}
          aria-label="Scroll right"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
