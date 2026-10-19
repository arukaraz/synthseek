import { describe, expect, it } from "vitest";

import { brandLink, headerContainer, headerTab, kbd, omniPill, scopeChip } from "../styles";

describe("TopHeader styles", () => {
  it("sizes the desktop header from the shared header token the player panels also read", () => {
    expect(headerContainer()).toContain("sm:h-[var(--height-header-wide)]");
    expect(headerContainer()).toContain("h-16");
  });

  it("shows the search box at every width, open or closed", () => {
    expect(omniPill({ open: false })).not.toContain("hidden");
    expect(omniPill({ open: true })).not.toContain("hidden");
  });

  it("gives the phone's top bar to the search box and keeps the logo for wider screens", () => {
    expect(brandLink()).toContain("hidden");
    expect(brandLink()).toContain("sm:flex");
  });

  it("keeps the keyboard shortcut hint for screens wide enough to leave the search placeholder whole", () => {
    expect(kbd()).toContain("hidden");
    expect(kbd()).toContain("lg:inline-flex");
    expect(kbd()).not.toContain("sm:inline-flex");
  });

  it("fills the active nav chip and the active scope with the primary pair", () => {
    expect(headerTab({ active: true })).toContain("bg-primary text-primary-foreground");
    expect(scopeChip({ active: true })).toContain("bg-primary text-primary-foreground");
    expect(headerTab({ active: false })).not.toContain("bg-primary");
  });
});
