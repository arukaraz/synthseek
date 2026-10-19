"use client";

import { useEffect, useState } from "react";

import { SCROLL_EDGE_TOLERANCE_PX } from "./constants";
import { scrollEdgesOf } from "./helpers";
import type { ScrollAxis, ScrollEdges, ScrollEdgesState } from "./types";

const NO_EDGES: ScrollEdges = { start: false, end: false };

export function useScrollEdges<T extends HTMLElement>(axis: ScrollAxis): ScrollEdgesState<T> {
  const [node, setNode] = useState<T | null>(null);
  const [edges, setEdges] = useState<ScrollEdges>(NO_EDGES);

  useEffect(() => {
    if (node === null) return;
    const update = () => {
      const next = scrollEdgesOf(node, axis, SCROLL_EDGE_TOLERANCE_PX);
      setEdges((current) => (current.start === next.start && current.end === next.end ? current : next));
    };
    update();
    node.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(node);
    Array.from(node.children).forEach((child) => resize.observe(child));
    const mutation = new MutationObserver(() => {
      Array.from(node.children).forEach((child) => resize.observe(child));
      update();
    });
    mutation.observe(node, { childList: true });
    return () => {
      node.removeEventListener("scroll", update);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [node, axis]);

  return { ref: setNode, node, start: node !== null && edges.start, end: node !== null && edges.end };
}
