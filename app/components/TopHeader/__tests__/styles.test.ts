import { describe, expect, it } from "vitest";

import { brandLink, headerContainer, headerTab, omniPill, scopeChip } from "../styles";

describe("TopHeader styles", () => {
  it("sizes the desktop header from the shared header token the player panels also read", () => {
    expect(headerContainer()).toContain("sm:h-[var(--height-header-wide)]");
    expect(headerContainer()).toContain("h-16");
  });

  it("hides the closed Omnibar on phones and shows it everywhere once it opens", () => {
    expect(omniPill({ open: false })).toContain("hidden sm:flex");
    expect(omniPill({ open: true })).not.toContain("hidden");
  });

  it("hides the logo on phones while the search takes the bar", () => {
    expect(brandLink({ hidden: true })).toContain("hidden sm:flex");
    expect(brandLink({ hidden: false })).not.toContain("hidden");
  });

  it("fills the active nav chip and the active scope with the primary pair", () => {
    expect(headerTab({ active: true })).toContain("bg-primary text-primary-foreground");
    expect(scopeChip({ active: true })).toContain("bg-primary text-primary-foreground");
    expect(headerTab({ active: false })).not.toContain("bg-primary");
  });
});
