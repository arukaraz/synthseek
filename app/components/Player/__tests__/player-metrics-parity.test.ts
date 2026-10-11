import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function themeFile(path: string): string {
  return readFileSync(resolve(process.cwd(), "app/theme", path), "utf8");
}

describe("the player bar's height threshold", () => {
  it("gives the bar its wide height at the same width the bar takes its wide layout", () => {
    const container = /--container-player:\s*([\d.]+rem)/.exec(themeFile("tokens/primitives.css"))?.[1];
    const height = /@media \(min-width: ([\d.]+rem)\) \{\s*\.player-metrics \{/.exec(
      themeFile("utilities/player.css")
    )?.[1];

    expect(container).toBeDefined();
    expect(height).toBe(container);
  });
});
