import type { PageRangeItem } from "./types";

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let value = start; value <= end; value++) out.push(value);
  return out;
}

export function buildPageRange(current: number, total: number, siblings = 1): PageRangeItem[] {
  const totalSlots = siblings * 2 + 5;
  if (total <= totalSlots) return range(1, total);

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;
  const edgeCount = siblings * 2 + 3;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, edgeCount), "ellipsis", total];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, "ellipsis", ...range(total - edgeCount + 1, total)];
  }
  return [1, "ellipsis", ...range(leftSibling, rightSibling), "ellipsis", total];
}

export function pageRangeLabel(page: number, pageSize: number, total: number): { start: number; end: number } {
  if (total === 0) return { start: 0, end: 0 };
  return { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, total) };
}
