import { describe, expect, it } from "vitest";

import { render, screen } from "@test/test-utils";

import { TopTracksSkeleton } from "../TopTracksSkeleton";
import { SKELETON_LIST_PLACEHOLDERS } from "../constants";

describe("TopTracksSkeleton", () => {
  it("labels the loading region with the widget title for assistive tech", () => {
    render(<TopTracksSkeleton />);

    expect(screen.getByLabelText("Top Tracks")).toBeInTheDocument();
  });

  it("renders one row placeholder per skeleton slot beneath a single hero placeholder", () => {
    const { container } = render(<TopTracksSkeleton />);

    expect(container.querySelectorAll(".h-14.animate-pulse")).toHaveLength(SKELETON_LIST_PLACEHOLDERS.length);
    expect(container.querySelectorAll(".aspect-\\[4\\/5\\].animate-pulse")).toHaveLength(1);
  });
});
