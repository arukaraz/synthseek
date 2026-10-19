import { describe, expect, it } from "vitest";

import { render, screen } from "@test/test-utils";

import { TopTracksSkeleton } from "../TopTracksSkeleton";
import { SKELETON_LIST_PLACEHOLDERS } from "../constants";

describe("TopTracksSkeleton", () => {
  it("labels the loading region with the widget title for assistive tech", () => {
    render(<TopTracksSkeleton shape="tall" />);

    expect(screen.getByLabelText("Top Tracks")).toBeInTheDocument();
  });

  it("renders one row placeholder per skeleton slot beneath a single full-width hero placeholder", () => {
    const { container } = render(<TopTracksSkeleton shape="tall" />);

    expect(container.querySelectorAll(".h-14.animate-pulse")).toHaveLength(SKELETON_LIST_PLACEHOLDERS.length);
    expect(container.querySelectorAll(".aspect-\\[4\\/3\\].animate-pulse")).toHaveLength(1);
  });

  it("puts a narrower hero placeholder beside the rows for the compact shape", () => {
    const { container } = render(<TopTracksSkeleton shape="compact" />);

    expect(container.querySelectorAll(".w-2\\/5.animate-pulse")).toHaveLength(1);
    expect(container.querySelector(".aspect-\\[4\\/3\\]")).toBeNull();
  });
});
