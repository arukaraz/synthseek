import type { ScrollAxis, ScrollEdges, ScrollMetrics } from "./types";

export function canStartSheetDrag(target: EventTarget | null, boundary: HTMLElement): boolean {
  if (!(target instanceof Element)) return false;
  let node: Element | null = target;
  while (node && node !== boundary) {
    if (node instanceof HTMLElement && node.scrollTop > 0) {
      const { overflowY } = getComputedStyle(node);
      if (overflowY === "auto" || overflowY === "scroll") return false;
    }
    node = node.parentElement;
  }
  return true;
}

export function scrollEdgesOf(metrics: ScrollMetrics, axis: ScrollAxis, tolerance: number): ScrollEdges {
  const offset = axis === "x" ? Math.abs(metrics.scrollLeft) : metrics.scrollTop;
  const visible = axis === "x" ? metrics.clientWidth : metrics.clientHeight;
  const total = axis === "x" ? metrics.scrollWidth : metrics.scrollHeight;
  return { start: offset > tolerance, end: offset + visible < total - tolerance };
}
