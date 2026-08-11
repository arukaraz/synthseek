import { describe, it, expect } from "vitest";
import {
  glassPanelCard,
  skeletonPulse,
  sectionHeader,
  seeAllLink,
  listItem,
  statCard,
  gridLayout,
  categoryCard,
  cardOverlay,
  cardContent,
  artistCard,
  hoverBorder,
} from "../styles";

describe("glassPanelCard", () => {
  it("returns base classes", () => {
    const result = glassPanelCard();
    expect(result).toContain("bg-surface/40");
    expect(result).toContain("bg-linear-to-br");
    expect(result).toContain("flex");
    expect(result).toContain("flex-col");
    expect(result).toContain("rounded-xl");
  });

  it("applies height full variant", () => {
    const result = glassPanelCard({ height: "full" });
    expect(result).toContain("h-full");
  });

  it("applies height auto variant", () => {
    const result = glassPanelCard({ height: "auto" });
    expect(result).not.toContain("h-full");
  });

  it("applies width full variant", () => {
    const result = glassPanelCard({ width: "full" });
    expect(result).toContain("w-full");
  });
});

describe("skeletonPulse", () => {
  it("returns base classes with animation", () => {
    const result = skeletonPulse();
    expect(result).toContain("animate-pulse");
    expect(result).toContain("rounded");
  });

  it("applies size variants", () => {
    expect(skeletonPulse({ size: "xs" })).toContain("h-3");
    expect(skeletonPulse({ size: "sm" })).toContain("h-4");
    expect(skeletonPulse({ size: "md" })).toContain("h-5");
    expect(skeletonPulse({ size: "lg" })).toContain("h-6");
    expect(skeletonPulse({ size: "xl" })).toContain("h-20");
  });

  it("applies width variants", () => {
    expect(skeletonPulse({ width: "full" })).toContain("w-full");
    expect(skeletonPulse({ width: "sm" })).toContain("w-20");
    expect(skeletonPulse({ width: "md" })).toContain("w-28");
    expect(skeletonPulse({ width: "lg" })).toContain("w-36");
    expect(skeletonPulse({ width: "xl" })).toContain("w-48");
  });
});

describe("sectionHeader", () => {
  it("returns flex layout", () => {
    const result = sectionHeader();
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("justify-between");
  });

  it("applies spacing variants", () => {
    expect(sectionHeader({ spacing: "sm" })).toContain("mb-3");
    expect(sectionHeader({ spacing: "md" })).toContain("mb-4");
  });
});

describe("seeAllLink", () => {
  it("returns font styling", () => {
    const result = seeAllLink();
    expect(result).toContain("font-medium");
    expect(result).toContain("transition-colors");
  });

  it("applies size variants", () => {
    expect(seeAllLink({ size: "sm" })).toContain("text-sm");
    expect(seeAllLink({ size: "xs" })).toContain("text-xs");
  });

  it("applies primary color variant", () => {
    const result = seeAllLink({ color: "primary" });
    expect(result).toContain("text-primary-400");
    expect(result).toContain("hover:underline");
  });
});

describe("listItem", () => {
  it("returns group and flex layout", () => {
    const result = listItem();
    expect(result).toContain("group");
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
  });

  it("applies default variant with border and background", () => {
    const result = listItem({ variant: "default" });
    expect(result).toMatch(/\bborder\b/);
    expect(result).toMatch(/\bp-3\b/);
  });

  it("applies ghost variant without padding and border", () => {
    const result = listItem({ variant: "ghost" });
    expect(result).not.toMatch(/\bp-3\b/);
    expect(result).not.toMatch(/\bborder\b/);
  });

  it("applies lift hover variant", () => {
    const result = listItem({ hover: "lift" });
    expect(result).toContain("hover:shadow-md");
  });
});

describe("statCard", () => {
  it("returns flex centered layout", () => {
    const result = statCard();
    expect(result).toContain("flex");
    expect(result).toContain("flex-col");
    expect(result).toContain("items-center");
    expect(result).toContain("justify-center");
  });

  it("applies size variants", () => {
    expect(statCard({ size: "sm" })).toContain("p-2");
    expect(statCard({ size: "md" })).toContain("p-3");
    expect(statCard({ size: "lg" })).toContain("p-6");
  });

  it("applies border variant", () => {
    expect(statCard({ border: "default" })).toContain("border");
    expect(statCard({ border: "none" })).not.toContain("border-fg/10");
  });
});

describe("gridLayout", () => {
  it("returns grid layout", () => {
    const result = gridLayout();
    expect(result).toContain("grid");
    expect(result).toContain("gap-3");
  });

  it("applies cols variants", () => {
    expect(gridLayout({ cols: 2 })).toContain("grid-cols-2");
    expect(gridLayout({ cols: 3 })).toContain("grid-cols-3");
    expect(gridLayout({ cols: "auto" })).toContain("grid-flow-dense");
  });
});

describe("categoryCard", () => {
  it("returns cursor pointer and overflow hidden", () => {
    const result = categoryCard();
    expect(result).toContain("cursor-pointer");
    expect(result).toContain("overflow-hidden");
    expect(result).toContain("rounded-lg");
  });

  it("applies size variants", () => {
    expect(categoryCard({ size: "small" })).toContain("row-span-1");
    expect(categoryCard({ size: "medium" })).toContain("row-span-2");
  });

  it("applies hover scale variant", () => {
    const result = categoryCard({ hover: "scale" });
    expect(result).toContain("hover:scale-[1.02]");
    expect(result).toContain("hover:shadow-lg");
  });
});

describe("cardOverlay", () => {
  it("returns absolute positioning", () => {
    const result = cardOverlay();
    expect(result).toContain("absolute");
    expect(result).toContain("inset-0");
  });

  it("applies gradient variants", () => {
    expect(cardOverlay({ gradient: "dark" })).toContain("from-black/80");
    expect(cardOverlay({ gradient: "light" })).toContain("from-black/60");
  });
});

describe("cardContent", () => {
  it("returns absolute flex layout", () => {
    const result = cardContent();
    expect(result).toContain("absolute");
    expect(result).toContain("flex");
    expect(result).toContain("flex-col");
  });

  it("applies position variants", () => {
    expect(cardContent({ position: "bottom" })).toContain("bottom-0");
    expect(cardContent({ position: "full" })).toContain("inset-0");
  });
});

describe("artistCard", () => {
  it("returns group with cursor pointer", () => {
    const result = artistCard();
    expect(result).toContain("group");
    expect(result).toContain("cursor-pointer");
    expect(result).toContain("overflow-hidden");
  });

  it("applies rounded variants", () => {
    expect(artistCard({ rounded: "lg" })).toContain("rounded-lg");
    expect(artistCard({ rounded: "xl" })).toContain("rounded-xl");
  });

  it("applies hover lift variant", () => {
    const result = artistCard({ hover: "lift" });
    expect(result).toContain("hover:-translate-y-1");
    expect(result).toContain("hover:shadow-xl");
  });
});

describe("hoverBorder", () => {
  it("returns absolute border styling", () => {
    const result = hoverBorder();
    expect(result).toContain("absolute");
    expect(result).toContain("inset-0");
    expect(result).toContain("border-2");
    expect(result).toContain("border-transparent");
  });

  it("applies primary color variant", () => {
    const result = hoverBorder({ color: "primary" });
    expect(result).toContain("group-hover:border-primary-500/50");
  });

  it("applies rounded variants", () => {
    expect(hoverBorder({ rounded: "lg" })).toContain("rounded-lg");
    expect(hoverBorder({ rounded: "xl" })).toContain("rounded-xl");
  });
});
