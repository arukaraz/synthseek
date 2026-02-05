import { describe, it, expect } from "vitest";
import { render } from "@test/test-utils";
import { LastRequestsSkeleton } from "../LastRequestsSkeleton";

describe("LastRequestsSkeleton", () => {
  it("renders 5 skeleton items", () => {
    const { container } = render(<LastRequestsSkeleton />);

    const skeletonItems = container.querySelectorAll(".animate-pulse");
    expect(skeletonItems.length).toBeGreaterThanOrEqual(5);
  });

  it("renders skeleton with album art placeholder", () => {
    const { container } = render(<LastRequestsSkeleton />);

    const albumPlaceholders = container.querySelectorAll(".h-12.w-12");
    expect(albumPlaceholders.length).toBe(5);
  });

  it("renders skeleton with text placeholders", () => {
    const { container } = render(<LastRequestsSkeleton />);

    const textPlaceholders = container.querySelectorAll(".h-4, .h-3");
    expect(textPlaceholders.length).toBeGreaterThan(0);
  });

  it("renders skeleton with badge placeholder", () => {
    const { container } = render(<LastRequestsSkeleton />);

    const badgePlaceholders = container.querySelectorAll(".rounded-full");
    expect(badgePlaceholders.length).toBe(5);
  });

  it("applies space-y-2 spacing", () => {
    const { container } = render(<LastRequestsSkeleton />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("space-y-2");
  });
});
