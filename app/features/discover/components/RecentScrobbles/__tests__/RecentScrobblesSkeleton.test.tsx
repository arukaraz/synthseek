import { describe, expect, it } from "vitest";

import { render, screen } from "@test/test-utils";

import { SKELETON_PLACEHOLDERS } from "../constants";
import { RecentScrobblesSkeleton } from "../RecentScrobblesSkeleton";

describe("RecentScrobblesSkeleton", () => {
  it("labels the region with the widget title and renders one placeholder per slot", () => {
    const { container } = render(<RecentScrobblesSkeleton />);

    expect(screen.getByLabelText("Recent Scrobbles")).toBeInTheDocument();
    expect(container.querySelectorAll(".snap-x > div")).toHaveLength(SKELETON_PLACEHOLDERS.length);
  });
});
