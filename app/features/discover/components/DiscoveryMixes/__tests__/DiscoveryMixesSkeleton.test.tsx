import { describe, expect, it } from "vitest";

import { render, screen } from "@test/test-utils";

import { DiscoveryMixesSkeleton } from "../DiscoveryMixesSkeleton";
import { SKELETON_PLACEHOLDERS } from "../constants";

describe("DiscoveryMixesSkeleton", () => {
  it("labels the loading region with the widget title for assistive tech", () => {
    render(<DiscoveryMixesSkeleton />);

    expect(screen.getByLabelText("Discover Mixes")).toBeInTheDocument();
  });

  it("renders one placeholder card per skeleton slot", () => {
    const { container } = render(<DiscoveryMixesSkeleton />);

    expect(container.querySelectorAll(".aspect-\\[3\\/4\\].animate-pulse")).toHaveLength(SKELETON_PLACEHOLDERS.length);
  });
});
