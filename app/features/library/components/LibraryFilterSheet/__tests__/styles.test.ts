import { describe, expect, it } from "vitest";

import { sheetBody } from "../styles";

describe("sheetBody", () => {
  it("bounds its height so tall filter content scrolls within the sheet", () => {
    const result = sheetBody();
    expect(result).toContain("overflow-y-auto");
    expect(result).toContain("max-h-[calc(85dvh-7rem)]");
    expect(result).toContain("sm:max-h-[60vh]");
  });

  it("contains its own overscroll so the page behind does not chain-scroll", () => {
    expect(sheetBody()).toContain("overscroll-contain");
  });
});
