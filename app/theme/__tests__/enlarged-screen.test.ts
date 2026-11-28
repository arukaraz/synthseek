// @vitest-environment node
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { bottomNavContainer } from "@components/BottomNav/styles";
import { contentShell } from "@components/ContentShell/styles";
import { headerContainer } from "@components/TopHeader/styles";
import { TEXT_SIZE_ATTRIBUTE, TEXT_SIZE_SCALES, TEXT_SIZES } from "@modules/accessibility";

import { SHORT_WINDOW_MAX_HEIGHT_PX } from "../utilities/constants";

const THEME = resolve(process.cwd(), "app", "theme");
const INDEX = readFileSync(join(THEME, "index.css"), "utf8");
const RESET = readFileSync(join(THEME, "base", "reset.css"), "utf8");
const ACCESSIBILITY = readFileSync(join(THEME, "utilities", "accessibility.css"), "utf8");

describe("the text size scales", () => {
  it.each(TEXT_SIZES.filter((size) => size !== "normal"))(
    "the stylesheet scales %s by the number the code names",
    (size) => {
      const rule = new RegExp(`:root\\[${TEXT_SIZE_ATTRIBUTE}="${size}"\\]\\s*\\{\\s*--a11y-text-scale:\\s*([0-9.]+);`);

      const match = ACCESSIBILITY.match(rule);

      expect(match).not.toBeNull();
      expect(Number(match?.[1])).toBe(TEXT_SIZE_SCALES[size]);
    }
  );

  it("has no rule for normal, so the default page carries nothing the stylesheet could change", () => {
    expect(ACCESSIBILITY).not.toContain(`${TEXT_SIZE_ATTRIBUTE}="normal"`);
    expect(TEXT_SIZE_SCALES.normal).toBe(1);
  });

  it("multiplies the root size by a scale that falls back to one, after the theme's own scale", () => {
    expect(RESET).toContain("font-size: calc(100% * var(--ui-scale, 1) * var(--a11y-text-scale, 1));");
  });

  it("only ever grows the text", () => {
    const scales = TEXT_SIZES.map((size) => TEXT_SIZE_SCALES[size]);

    expect([...scales].sort((left, right) => left - right)).toEqual(scales);
    expect(Math.min(...scales)).toBe(1);
  });
});

describe("the short window", () => {
  it("is declared once, at the height the code names", () => {
    expect(INDEX).toContain(`@custom-variant short-window (@media (max-height: ${SHORT_WINDOW_MAX_HEIGHT_PX}px));`);
    expect(INDEX.split("@custom-variant short-window")).toHaveLength(2);
  });

  it("sits below the 256 px a 1280 by 1024 screen leaves at 400 percent, and above nothing a phone sideways reaches", () => {
    expect(SHORT_WINDOW_MAX_HEIGHT_PX).toBeGreaterThan(256);
    expect(SHORT_WINDOW_MAX_HEIGHT_PX).toBeLessThan(320);
  });

  it("releases the top bar, the bottom bar and the content height, and only through the short-window variant", () => {
    expect(headerContainer()).toContain("short-window:static");
    expect(bottomNavContainer()).toContain("short-window:static");
    expect(contentShell()).toContain("short-window:h-auto");
    expect(contentShell()).toContain("short-window:overflow-visible");
    for (const classes of [headerContainer(), bottomNavContainer(), contentShell()]) {
      expect(classes).not.toMatch(/(^| )static( |$)/);
    }
  });

  it("gives the bottom bar's height back only inside the short window", () => {
    const rule = ACCESSIBILITY.indexOf("@variant short-window");

    expect(rule).toBeGreaterThan(-1);
    expect(ACCESSIBILITY.slice(rule)).toMatch(/@variant short-window \{\s*--height-bottom-nav: 0px;/);
  });
});
