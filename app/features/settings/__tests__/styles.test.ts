import { describe, expect, it } from "vitest";

import { sidebarGroupButton } from "../styles";

describe("sidebarGroupButton", () => {
  it("brightens to the full foreground when active", () => {
    const result = sidebarGroupButton({ active: true });
    expect(result).toContain("text-fg");
    expect(result).not.toContain("text-fg/80");
  });

  it("stays dimmed when inactive", () => {
    expect(sidebarGroupButton({ active: false })).toContain("text-fg/80");
  });
});
