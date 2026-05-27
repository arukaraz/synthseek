"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RecentRequestCard } from "./RecentRequestCard";
import { stripCard, stripEdgeBase, stripEdgeButton, stripFrame, stripScroller } from "./styles";
import type { RecentRequestsStripProps } from "./types";

export function RecentRequestsStrip({ items }: RecentRequestsStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateAffordances = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
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
  }, [updateAffordances, items.length]);

  const scrollByOne = useCallback((direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const step = first instanceof HTMLElement ? first.offsetWidth : el.clientWidth;
    el.scrollBy({ left: direction === "right" ? step : -step, behavior: "smooth" });
  }, []);

  return (
    <div className={stripFrame()}>
      <div ref={scrollerRef} className={stripScroller()}>
        {items.map((request) => (
          <div key={request.id} className={stripCard()}>
            <RecentRequestCard request={request} />
          </div>
        ))}
      </div>

      <div className={stripEdgeBase({ side: "left", visible: canScrollLeft })} aria-hidden={!canScrollLeft}>
        <button
          type="button"
          onClick={() => scrollByOne("left")}
          aria-label="Scroll to previous requests"
          disabled={!canScrollLeft}
          className={stripEdgeButton()}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className={stripEdgeBase({ side: "right", visible: canScrollRight })} aria-hidden={!canScrollRight}>
        <button
          type="button"
          onClick={() => scrollByOne("right")}
          aria-label="Scroll to next requests"
          disabled={!canScrollRight}
          className={stripEdgeButton()}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
