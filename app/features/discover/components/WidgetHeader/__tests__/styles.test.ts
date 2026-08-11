import { describe, expect, it } from "vitest";

import {
  widgetHeaderActionLink,
  widgetHeaderIcon,
  widgetHeaderLead,
  widgetHeaderRow,
  widgetHeaderSkeletonIcon,
  widgetHeaderSkeletonSubtitle,
  widgetHeaderSkeletonTitle,
  widgetHeaderSubtitle,
  widgetHeaderTitle,
  widgetHeaderTitleStack,
} from "../styles";

describe("widgetHeaderRow", () => {
  it("lays out the icon-title stack and trailing action on opposite ends", () => {
    const result = widgetHeaderRow();
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("justify-between");
    expect(result).toContain("mb-4");
  });
});

describe("widgetHeaderLead", () => {
  it("keeps the icon to the left of the title stack and centered against it", () => {
    const result = widgetHeaderLead();
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("gap-3");
  });
});

describe("widgetHeaderIcon", () => {
  it("renders a neutral primary-tinted chip, not a content-type color", () => {
    const result = widgetHeaderIcon();
    expect(result).toContain("bg-primary-500/15");
    expect(result).toContain("text-primary-400");
    expect(result).toContain("rounded-lg");
    expect(result).toContain("shrink-0");
    expect(result).not.toContain("type-text");
    expect(result).not.toContain("type-badge");
  });
});

describe("widgetHeaderTitleStack", () => {
  it("stacks title over subtitle so the subtitle aligns under the title", () => {
    const result = widgetHeaderTitleStack();
    expect(result).toContain("flex");
    expect(result).toContain("flex-col");
  });
});

describe("widgetHeaderTitle", () => {
  it("is the primary full-foreground semibold title", () => {
    const result = widgetHeaderTitle();
    expect(result).toContain("text-fg");
    expect(result).toContain("font-semibold");
  });
});

describe("widgetHeaderSubtitle", () => {
  it("uses the muted semantic token that resolves darker in light theme", () => {
    const result = widgetHeaderSubtitle();
    expect(result).toContain("text-fg-muted");
    expect(result).toContain("text-xs");
  });
});

describe("widgetHeaderActionLink", () => {
  it("is a quiet primary-tint link with a visible focus ring", () => {
    const result = widgetHeaderActionLink();
    expect(result).toContain("text-primary-400");
    expect(result).toContain("hover:underline");
    expect(result).toContain("focus-visible:ring-1");
  });
});

describe("widgetHeader skeleton roles", () => {
  it("mirrors the header with an icon chip, title bar and shorter subtitle bar", () => {
    expect(widgetHeaderSkeletonIcon()).toContain("animate-pulse");
    expect(widgetHeaderSkeletonIcon()).toContain("size-8");
    expect(widgetHeaderSkeletonTitle()).toContain("animate-pulse");
    expect(widgetHeaderSkeletonSubtitle()).toContain("animate-pulse");
    expect(widgetHeaderSkeletonSubtitle()).toContain("w-20");
    expect(widgetHeaderSkeletonTitle()).toContain("w-28");
  });
});
