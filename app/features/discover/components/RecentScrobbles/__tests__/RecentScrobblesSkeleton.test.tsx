import { describe, expect, it } from "vitest";

import { render, screen } from "@test/test-utils";

import { SKELETON_PLACEHOLDERS } from "../constants";
import { RecentScrobblesSkeleton } from "../RecentScrobblesSkeleton";

describe("RecentScrobblesSkeleton", () => {
  it("labels the region with the widget title and renders one rail placeholder per slot", () => {
    const { container } = render(<RecentScrobblesSkeleton layout="rail" />);

    expect(screen.getByLabelText("Recent Scrobbles")).toBeInTheDocument();
    expect(container.querySelectorAll(".snap-x > div")).toHaveLength(SKELETON_PLACEHOLDERS.length);
  });

  it("renders stacked row placeholders instead of the rail for the timeline layout", () => {
    const { container } = render(<RecentScrobblesSkeleton layout="timeline" />);

    expect(container.querySelector(".snap-x")).toBeNull();
    expect(container.querySelectorAll(".flex-col > .h-12")).toHaveLength(SKELETON_PLACEHOLDERS.length);
  });
});
