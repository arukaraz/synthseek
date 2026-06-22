import { describe, it, expect } from "vitest";
import { render } from "@test/test-utils";
import { TrendingHeroSkeleton } from "../TrendingHeroSkeleton";

describe("TrendingHeroSkeleton", () => {
  it("renders animated placeholder bars", () => {
    const { container } = render(<TrendingHeroSkeleton />);

    const bars = container.querySelectorAll(".bg-fg\\/10");
    expect(bars.length).toBeGreaterThan(0);
  });

  it("renders a rounded button placeholder", () => {
    const { container } = render(<TrendingHeroSkeleton />);

    expect(container.querySelector(".rounded-md")).toBeInTheDocument();
  });
});
