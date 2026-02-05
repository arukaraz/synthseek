import { describe, it, expect } from "vitest";
import { render } from "@test/test-utils";
import { SkeletonCard, SkeletonGrid, SkeletonSection } from "../Skeleton";

describe("SkeletonCard", () => {
  it("renders a skeleton card container", () => {
    const { container } = render(<SkeletonCard />);

    const card = container.firstChild;
    expect(card).toHaveClass("bg-fg/5", "rounded-lg");
  });

  it("has animated pulse elements", () => {
    const { container } = render(<SkeletonCard />);

    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("renders aspect-square image placeholder", () => {
    const { container } = render(<SkeletonCard />);

    const imageArea = container.querySelector(".aspect-square");
    expect(imageArea).toBeInTheDocument();
  });

  it("renders text skeleton lines", () => {
    const { container } = render(<SkeletonCard />);

    const textLines = container.querySelectorAll(".animate-pulse.rounded");
    expect(textLines.length).toBeGreaterThanOrEqual(2);
  });
});

describe("SkeletonGrid", () => {
  it("renders default 12 skeleton cards", () => {
    const { container } = render(<SkeletonGrid />);

    const cards = container.querySelectorAll(".bg-fg\\/5.rounded-lg");
    expect(cards).toHaveLength(12);
  });

  it("renders custom count of skeleton cards", () => {
    const { container } = render(<SkeletonGrid count={4} />);

    const cards = container.querySelectorAll(".bg-fg\\/5.rounded-lg");
    expect(cards).toHaveLength(4);
  });

  it("has grid layout class", () => {
    const { container } = render(<SkeletonGrid />);

    const grid = container.firstChild;
    expect(grid).toHaveClass("grid-responsive-results");
  });

  it("renders no cards when count is 0", () => {
    const { container } = render(<SkeletonGrid count={0} />);

    const cards = container.querySelectorAll(".bg-fg\\/5.rounded-lg");
    expect(cards).toHaveLength(0);
  });
});

describe("SkeletonSection", () => {
  it("renders a section with title skeleton", () => {
    const { container } = render(<SkeletonSection />);

    const titleSkeleton = container.querySelector(".mb-4.h-7");
    expect(titleSkeleton).toBeInTheDocument();
    expect(titleSkeleton).toHaveClass("animate-pulse");
  });

  it("renders a skeleton grid", () => {
    const { container } = render(<SkeletonSection />);

    const grid = container.querySelector(".grid-responsive-results");
    expect(grid).toBeInTheDocument();
  });

  it("renders 12 skeleton cards in the grid", () => {
    const { container } = render(<SkeletonSection />);

    const cards = container.querySelectorAll(".bg-fg\\/5.rounded-lg");
    expect(cards).toHaveLength(12);
  });
});
