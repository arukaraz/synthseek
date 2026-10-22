import { describe, expect, it } from "vitest";

import { render } from "@test/test-utils";

import { SKELETON_CELLS } from "../constants";
import { RecentRequestsSkeleton } from "../RecentRequestsSkeleton";

describe("RecentRequestsSkeleton", () => {
  it("renders one row placeholder per configured slot inside a stacked list", () => {
    const { container } = render(<RecentRequestsSkeleton />);

    const cells = container.querySelectorAll(".animate-pulse");
    expect(cells).toHaveLength(SKELETON_CELLS);
    expect(cells[0]?.parentElement).toHaveClass("flex-col");
    expect(cells[0]).toHaveClass("h-12");
  });
});
