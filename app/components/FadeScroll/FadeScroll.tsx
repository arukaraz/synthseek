"use client";

import { useTranslation } from "react-i18next";

import { hiddenScrollbar, scrollFade } from "@components/ui/styles";
import { useScrollEdges } from "@hooks/ui/useScrollEdges";
import { cn } from "@utils/cn";

import { SCROLL_PAGE_SHARE } from "./constants";
import { ScrollEdge } from "./ScrollEdge";
import { fadeScroll, fadeScrollFrame } from "./styles";
import type { FadeScrollProps, ScrollEdgeSide } from "./types";

export function FadeScroll({ axis = "y", arrows = false, className, label, children }: FadeScrollProps) {
  const { t } = useTranslation("components");
  const edges = useScrollEdges<HTMLDivElement>(axis);

  const scroller = (
    <div
      ref={edges.ref}
      className={cn(
        fadeScroll({ axis }),
        hiddenScrollbar(),
        scrollFade({ axis, start: edges.start, end: edges.end }),
        className
      )}
      role={label ? "region" : undefined}
      aria-label={label}
      tabIndex={label ? 0 : undefined}
    >
      {children}
    </div>
  );

  if (axis !== "x" || !arrows) return scroller;

  const page = (side: ScrollEdgeSide) => {
    const node = edges.node;
    if (!node) return;
    const step = node.clientWidth * SCROLL_PAGE_SHARE;
    node.scrollBy({ left: side === "right" ? step : -step, behavior: "smooth" });
  };

  return (
    <div className={fadeScrollFrame()}>
      {scroller}
      <ScrollEdge side="left" visible={edges.start} label={t("fadeScroll.scrollLeft")} onClick={() => page("left")} />
      <ScrollEdge side="right" visible={edges.end} label={t("fadeScroll.scrollRight")} onClick={() => page("right")} />
    </div>
  );
}
