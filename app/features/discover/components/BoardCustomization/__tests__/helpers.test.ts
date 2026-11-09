import { describe, expect, it } from "vitest";

import { phonePaneOf } from "../helpers";

describe("phonePaneOf", () => {
  it("names the widgets pane whatever the board was left on", () => {
    expect(phonePaneOf("widgets", "arrange", "appearance")).toBe("widgets");
    expect(phonePaneOf("widgets", "settings", "templates")).toBe("widgets");
  });

  it("names the arrangement while the board shows it", () => {
    expect(phonePaneOf("board", "arrange", "templates")).toBe("arrange");
  });

  it("names the settings tab while the board shows its settings", () => {
    expect(phonePaneOf("board", "settings", "appearance")).toBe("appearance");
    expect(phonePaneOf("board", "settings", "templates")).toBe("templates");
  });
});
