import { describe, expect, it } from "vitest";

import { sizeClasses } from "../IconButton/styles";
import { stopBadge } from "@components/Player/styles";
import { sizeChip } from "@features/discover/components/ExploreBoard/styles";
import { galleryDot } from "@features/settings/components/WhatsNew/styles";

const MINIMUM = 24;
const SMALLEST_GAP_BETWEEN_ICON_BUTTONS = 4;
const REM = 4;

interface Box {
  left: number;
  width: number;
}

function insetOf(classes: string): number {
  const token = classes.split(" ").find((entry) => entry.startsWith("after:-inset-"));
  if (token === undefined) return 0;
  return Number(token.slice("after:-inset-".length)) * REM;
}

function boxAt(left: number, drawn: number, inset: number): Box {
  return { left: left - inset, width: drawn + inset * 2 };
}

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.left + b.width && b.left < a.left + a.width;
}

describe("the expanded hit area of the small icon button", () => {
  const drawn = 12 + 4 * 2;
  const inset = insetOf(sizeClasses.sm);

  it("reaches 24 px without changing what is drawn", () => {
    expect(drawn + inset * 2).toBeGreaterThanOrEqual(MINIMUM);
    expect(sizeClasses.sm).toContain("p-1");
  });

  it("does not cover its neighbour at the tightest gap the buttons are placed with", () => {
    const first = boxAt(0, drawn, inset);
    const second = boxAt(drawn + SMALLEST_GAP_BETWEEN_ICON_BUTTONS, drawn, inset);

    expect(overlaps(first, second)).toBe(false);
  });

  it("would cover it if the area grew past the gap, which is what the check guards", () => {
    const first = boxAt(0, drawn, inset + 1);
    const second = boxAt(drawn + SMALLEST_GAP_BETWEEN_ICON_BUTTONS, drawn, inset + 1);

    expect(overlaps(first, second)).toBe(true);
  });

  it("is left to the larger sizes, which already reach the minimum", () => {
    expect(sizeClasses.md).not.toContain("after:");
    expect(sizeClasses.lg).not.toContain("after:");
  });
});

describe("the other undersized controls", () => {
  it("makes the carousel dot 24 px wide", () => {
    expect(galleryDot({ current: false })).toContain("w-6");
  });

  it("grows the stop badge only inside the mode", () => {
    expect(stopBadge({ size: "bar" })).toContain("size-5");
    expect(stopBadge({ size: "bar" })).toContain("a11y-mode:size-6");
  });

  it("grows the dense size chips of the board only inside the mode", () => {
    const classes = sizeChip({ active: false, dense: true });

    expect(classes).toContain("h-5");
    expect(classes).toContain("a11y-mode:h-6");
    expect(classes).toContain("a11y-mode:min-w-6");
  });
});
