"use client";

import { useEffect, useState } from "react";

import { SCROLL_REVEAL_TOLERANCE_PX } from "./constants";
import { scrollRevealOf } from "./helpers";
import type { RevealOnScrollUpState } from "./types";

export function useRevealOnScrollUp<T extends HTMLElement>(): RevealOnScrollUpState<T> {
  const [node, setNode] = useState<T | null>(null);
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    if (node === null) return;
    const anchors = new WeakMap<Element, number>();
    const onScroll = (event: Event) => {
      const scroller = event.target instanceof Element ? event.target : document.scrollingElement;
      if (scroller === null || !scroller.contains(node)) return;
      const offset = scroller.scrollTop;
      const reveal = scrollRevealOf(anchors.get(scroller) ?? 0, offset, SCROLL_REVEAL_TOLERANCE_PX);
      if (reveal === "keep") return;
      anchors.set(scroller, offset);
      setRevealed(reveal === "show");
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, [node]);

  return { ref: setNode, revealed: node === null || revealed };
}
