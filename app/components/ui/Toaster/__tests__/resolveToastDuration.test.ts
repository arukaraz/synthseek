import { describe, expect, it } from "vitest";

import type { A11yToastDuration } from "@modules/accessibility";

import { resolveToastDuration } from "../helpers";

describe("resolveToastDuration", () => {
  it.each<[A11yToastDuration, boolean, number]>([
    ["default", false, 2000],
    ["default", true, 4000],
    ["2", false, 2000],
    ["2", true, 2000],
    ["4", false, 4000],
    ["4", true, 4000],
    ["8", false, 8000],
    ["8", true, 8000],
    ["sticky", false, Number.POSITIVE_INFINITY],
    ["sticky", true, Number.POSITIVE_INFINITY],
  ])("choice %s with mode %s lasts %s ms", (choice, mode, expected) => {
    expect(resolveToastDuration(choice, mode)).toBe(expected);
  });
});
