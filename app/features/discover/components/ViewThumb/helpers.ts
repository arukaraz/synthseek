import type { WidgetBlock } from "@hooks/api/queries/widgets/types";

import type { ThumbMark, ThumbTone } from "./types";

function box(x: number, y: number, width: number, height: number, radius: number, tone: ThumbTone): ThumbMark {
  return { kind: "box", x, y, width, height, radius, tone };
}

function line(d: string): ThumbMark {
  return { kind: "line", d, tone: "primary" };
}

function times(count: number, mark: (index: number) => ThumbMark | ThumbMark[]): ThumbMark[] {
  return Array.from({ length: count }, (_, index) => mark(index)).flat();
}

function firstLit(index: number): ThumbTone {
  return index === 0 ? "primary" : "muted";
}

export function viewThumbMarks(block: WidgetBlock): ThumbMark[] {
  switch (block) {
    case "list":
      return times(3, (i) => [box(4, 3 + i * 12, 10, 10, 2, "primary"), box(18, 6 + i * 12, 50, 4, 2, "muted")]);
    case "leader":
      return [box(4, 4, 36, 32, 4, "primary"), ...times(3, (i) => box(46, 6 + i * 10, 48, 5, 2, "muted"))];
    case "cards":
      return times(3, (i) => box(4 + i * 32, 4, 28, 32, 4, firstLit(i)));
    case "rail":
      return times(4, (i) => box(4 + i * 24, 6, 20, 28, 4, firstLit(i)));
    case "mosaic":
      return times(6, (i) =>
        box(4 + (i % 3) * 32, 3 + Math.floor(i / 3) * 18, 28, 15, 3, i % 2 === 0 ? "primary" : "muted")
      );
    case "rankingMoves":
      return times(3, (i) => [
        box(4, 6 + i * 12, 60, 4, 2, "muted"),
        i === 1
          ? { kind: "shape", d: `M90,${14 + i * 12} l-4,-6 l-4,6 z`, tone: "success" }
          : { kind: "shape", d: `M82,${6 + i * 12} l4,6 l4,-6 z`, tone: "primary" },
      ]);
    case "stat":
      return [box(4, 8, 40, 18, 3, "primary"), box(4, 30, 30, 4, 2, "muted")];
    case "stats":
      return times(3, (i) => [box(4 + i * 32, 8, 26, 16, 3, firstLit(i)), box(4 + i * 32, 28, 20, 4, 2, "muted")]);
    case "statTrend":
      return [box(4, 10, 30, 16, 3, "primary"), line("M44,30 L56,22 L66,26 L78,12 L96,16")];
    case "bars":
      return [3, 8, 5, 10, 7, 11].map((height, i) =>
        box(6 + i * 15, 36 - height * 3, 10, height * 3, 2, i === 5 ? "primary" : "muted")
      );
    case "sparkline":
      return [line("M4,32 L20,24 L36,28 L52,14 L68,18 L84,8 L96,12")];
    case "yearCalendar":
      return times(42, (i) =>
        box(4 + Math.floor(i / 7) * 15, 3 + (i % 7) * 5, 12, 4, 1, (i * 7) % 5 < 2 ? "primary" : "muted")
      );
    case "heatmap":
      return times(24, (i) =>
        box(4 + (i % 8) * 12, 3 + Math.floor(i / 8) * 12, 10, 10, 2, (i * 5) % 7 < 3 ? "primary" : "muted")
      );
    case "share":
      return [box(4, 14, 40, 12, 2, "primary"), box(46, 14, 30, 12, 2, "muted"), box(78, 14, 18, 12, 2, "faint")];
    case "compare":
      return times(3, (i) => [
        box(4, 4 + i * 12, 50 - i * 12, 4, 2, "primary"),
        box(4, 9 + i * 12, 40 - i * 8, 4, 2, "accent"),
      ]);
    case "calendar":
      return times(3, (i) => [box(4, 4 + i * 12, 14, 8, 2, "primary"), box(24, 6 + i * 12, 50, 4, 2, "muted")]);
    case "feed":
      return times(2, (i) => [box(4, 4 + i * 18, 60, 5, 2, "primary"), box(4, 12 + i * 18, 90, 3, 1, "muted")]);
    case "story":
      return [
        box(4, 3, 92, 28, 5, "primary"),
        ...times(4, (i) => ({ kind: "dot", cx: 40 + i * 7, cy: 36, r: 2, tone: firstLit(i) })),
      ];
  }
}
