"use client";

import { hiddenScrollbar, scrollFade } from "@components/ui/styles";
import { useScrollEdges } from "@hooks/ui/useScrollEdges";
import { cn } from "@utils/cn";

import { fadeScroll } from "./styles";
import type { FadeScrollProps } from "./types";

export function FadeScroll({ axis = "y", className, label, children }: FadeScrollProps) {
  const edges = useScrollEdges<HTMLDivElement>(axis);

  return (
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
}
