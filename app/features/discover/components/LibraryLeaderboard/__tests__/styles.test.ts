import { describe, it, expect } from "vitest";

import {
  panelFrame,
  errorFrame,
  skeletonFrame,
  tabsContainer,
  tabActive,
  tabInactive,
  sectionHeaderRow,
  sectionHeaderLabel,
  heroFrame,
  heroGhostRank,
  heroThumb,
  heroThumbOverlay,
  heroRankLabel,
  heroContent,
  heroName,
  heroCount,
  heroUnit,
  statsRow,
  statsValue,
  statsLabel,
  rowsContainer,
  rowGrid,
  rowRank,
  rowName,
  rowProgressTrack,
  rowProgressFill,
  rowCount,
} from "../styles";

describe("LibraryLeaderboard styles", () => {
  it("frames the panel as a full-height gradient surface", () => {
    expect(panelFrame()).toContain("flex");
    expect(panelFrame()).toContain("h-full");
    expect(panelFrame()).toContain("rounded-2xl");
  });

  it("centers the error frame content", () => {
    expect(errorFrame()).toContain("items-center");
    expect(errorFrame()).toContain("justify-center");
  });

  it("animates the skeleton frame", () => {
    expect(skeletonFrame()).toContain("animate-pulse");
  });

  it("renders the tab container as an inline rounded group", () => {
    expect(tabsContainer()).toContain("inline-flex");
    expect(tabsContainer()).toContain("rounded-lg");
  });

  it("gives the active tab a primary gradient and the inactive tab a muted foreground", () => {
    expect(tabActive()).toContain("from-primary-500");
    expect(tabActive()).toContain("text-overlay-fg");
    expect(tabInactive()).toContain("text-fg/60");
    expect(tabInactive()).toContain("hover:text-fg");
  });

  it("lays out the section header on opposite ends with a bottom border", () => {
    expect(sectionHeaderRow()).toContain("justify-between");
    expect(sectionHeaderRow()).toContain("border-b");
    expect(sectionHeaderLabel()).toContain("uppercase");
    expect(sectionHeaderLabel()).toContain("font-mono");
  });

  it("styles the hero frame, ghost rank, thumb and overlay", () => {
    expect(heroFrame()).toContain("relative");
    expect(heroGhostRank()).toContain("pointer-events-none");
    expect(heroThumb()).toContain("rounded-lg");
    expect(heroThumbOverlay()).toContain("bg-linear-to-t");
    expect(heroRankLabel()).toContain("font-mono");
    expect(heroContent()).toContain("flex-col");
    expect(heroName()).toContain("font-bold");
    expect(heroCount()).toContain("tabular-nums");
    expect(heroUnit()).toContain("font-mono");
  });

  it("styles the stats grid in three centered columns", () => {
    expect(statsRow()).toContain("grid-cols-3");
    expect(statsRow()).toContain("text-center");
    expect(statsValue()).toContain("tabular-nums");
    expect(statsLabel()).toContain("uppercase");
  });

  it("styles the rows container and progress bars", () => {
    expect(rowsContainer()).toContain("flex-col");
    expect(rowRank()).toContain("tabular-nums");
    expect(rowName()).toContain("truncate");
    expect(rowProgressTrack()).toContain("rounded-full");
    expect(rowProgressFill()).toContain("from-primary-400");
    expect(rowCount()).toContain("tabular-nums");
  });

  it("adds a bottom divider for non-last rows only", () => {
    expect(rowGrid({ last: false })).toContain("border-b");
    expect(rowGrid({ last: true })).not.toContain("border-b");
  });
});
