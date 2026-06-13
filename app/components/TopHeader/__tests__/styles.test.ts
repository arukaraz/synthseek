import { describe, it, expect } from "vitest";

import {
  headerContainer,
  decorativeLine,
  headerContent,
  searchGlow,
  clearButton,
  headerTab,
  headerTabLabel,
  headerTabUnderline,
  headerTabBadge,
  searchForm,
  searchShell,
  searchInput,
} from "../styles";

describe("TopHeader styles", () => {
  it("pins the header to the top with a responsive blur by default", () => {
    expect(headerContainer()).toContain("sticky");
    expect(headerContainer()).toContain("top-0");
    expect(headerContainer()).toContain("sm:backdrop-blur-2xl");
    expect(headerContainer({ blur: "none" })).not.toContain("backdrop-blur-2xl");
  });

  it("renders the decorative line with the primary gradient by default", () => {
    expect(decorativeLine()).toContain("via-primary-500");
  });

  it("lays out the header content row with default height", () => {
    expect(headerContent()).toContain("flex");
    expect(headerContent()).toContain("h-16");
  });

  it("renders the focus glow as a hidden blurred gradient that shows on desktop", () => {
    expect(searchGlow()).toContain("blur-sm");
    expect(searchGlow()).toContain("sm:block");
    expect(searchGlow()).toContain("from-primary-600");
  });

  it("positions the clear button to the right with hover affordance", () => {
    expect(clearButton()).toContain("absolute");
    expect(clearButton()).toContain("right-2.5");
    expect(clearButton()).toContain("hover:text-fg");
  });

  it("switches the header tab foreground on active state", () => {
    expect(headerTab({ active: true })).toContain("text-fg");
    expect(headerTab({ active: false })).toContain("text-fg/55");
    expect(headerTab({ mobile: "hide" })).toContain("hidden");
  });

  it("controls the tab label visibility per breakpoint", () => {
    expect(headerTabLabel({ mobile: "show" })).toContain("inline");
    expect(headerTabLabel({ mobile: "hide" })).toContain("hidden");
    expect(headerTabUnderline()).toContain("bg-primary-500");
    expect(headerTabBadge()).toContain("rounded-full");
  });

  it("renders the search form expanded on mobile and inline on desktop", () => {
    expect(searchForm()).toContain("flex");
    expect(searchForm()).toContain("sm:block");
  });

  it("highlights the search shell when focused", () => {
    expect(searchShell({ focused: true })).toContain("border-primary-500/50");
    expect(searchShell({ focused: false })).toContain("border-fg/10");
    expect(searchInput()).toContain("bg-transparent");
  });
});
