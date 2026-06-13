import { describe, expect, it } from "vitest";

import { dialogContent } from "../styles";

describe("dialogContent default variant", () => {
  it("renders above the bottom nav z-30 tier", () => {
    expect(dialogContent({ animation: "default" })).toContain("z-50");
  });

  it("drives enter and exit with the tw-animate-css classes", () => {
    const result = dialogContent({ animation: "default" });
    expect(result).toContain("data-[state=open]:animate-in");
    expect(result).toContain("data-[state=closed]:animate-out");
    expect(result).toContain("data-[state=open]:zoom-in-95");
    expect(result).toContain("data-[state=closed]:zoom-out-95");
  });
});

describe("dialogContent sheet variant", () => {
  it("no longer references the removed custom dialog-sheet keyframes", () => {
    expect(dialogContent({ animation: "sheet" })).not.toContain("dialog-sheet");
  });

  it("slides up from the bottom on mobile and resets to a centered zoom on desktop", () => {
    const result = dialogContent({ animation: "sheet" });
    expect(result).toContain("data-[state=open]:slide-in-from-bottom");
    expect(result).toContain("data-[state=closed]:slide-out-to-bottom");
    expect(result).toContain("sm:data-[state=open]:slide-in-from-bottom-0");
    expect(result).toContain("sm:data-[state=closed]:slide-out-to-bottom-0");
    expect(result).toContain("sm:data-[state=open]:zoom-in-95");
  });

  it("renders above the bottom nav z-30 tier", () => {
    expect(dialogContent({ animation: "sheet" })).toContain("z-50");
  });
});
