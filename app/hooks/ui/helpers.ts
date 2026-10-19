import type { ScrollAxis, ScrollEdges, ScrollMetrics, ScrollReveal } from "./types";

export function scrollRevealOf(anchor: number, offset: number, tolerance: number): ScrollReveal {
  if (offset <= tolerance) return "show";
  if (offset > anchor + tolerance) return "hide";
  if (offset < anchor - tolerance) return "show";
  return "keep";
}

export function scrollEdgesOf(metrics: ScrollMetrics, axis: ScrollAxis, tolerance: number): ScrollEdges {
  const offset = axis === "x" ? Math.abs(metrics.scrollLeft) : metrics.scrollTop;
  const visible = axis === "x" ? metrics.clientWidth : metrics.clientHeight;
  const total = axis === "x" ? metrics.scrollWidth : metrics.scrollHeight;
  return { start: offset > tolerance, end: offset + visible < total - tolerance };
}
