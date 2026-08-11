import { describe, expect, it } from "vitest";

import { sidebarGroupButton, sidebarItem } from "../styles";

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

describe("sidebarItem", () => {
  it("brightens to the full foreground when active, at rest and on hover", () => {
    const result = sidebarItem({ active: true });
    expect(result).toContain("text-fg");
    expect(result).not.toContain("text-fg/60");
    expect(result).not.toContain("hover:text-fg/90");
  });

  it("keeps the dimmed rest state and the hover lift when inactive", () => {
    const result = sidebarItem({ active: false });
    expect(result).toContain("text-fg/60");
    expect(result).toContain("hover:text-fg/90");
  });
});
