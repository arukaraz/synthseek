import { describe, expect, it } from "vitest";

import { nameAfterVisibleText } from "../accessibleName";

describe("nameAfterVisibleText", () => {
  it("puts what the control draws ahead of its name", () => {
    expect(nameAfterVisibleText("Rows per page", "10 / page")).toBe("10 / page Rows per page");
  });

  it("keeps the drawn parts in the order they are drawn", () => {
    expect(nameAfterVisibleText("Open", "Title", "Artist")).toBe("Title Artist Open");
  });

  it("leaves the name alone when nothing is drawn", () => {
    expect(nameAfterVisibleText("Filter and sort", "", null, undefined)).toBe("Filter and sort");
  });
});
