import type { ScrollAxis, ScrollEdges, ScrollMetrics } from "./types";

export function scrollEdgesOf(metrics: ScrollMetrics, axis: ScrollAxis, tolerance: number): ScrollEdges {
  const offset = axis === "x" ? Math.abs(metrics.scrollLeft) : metrics.scrollTop;
  const visible = axis === "x" ? metrics.clientWidth : metrics.clientHeight;
  const total = axis === "x" ? metrics.scrollWidth : metrics.scrollHeight;
  return { start: offset > tolerance, end: offset + visible < total - tolerance };
}
