import { describe, expect, it } from "vitest";

import { render } from "@test/test-utils";

import { SKELETON_CELLS } from "../constants";
import { RecentRequestsSkeleton } from "../RecentRequestsSkeleton";

describe("RecentRequestsSkeleton", () => {
  it("renders one placeholder cell per configured slot", () => {
    const { container } = render(<RecentRequestsSkeleton />);

    const strip = container.querySelector(".animate-pulse");
    expect(strip).not.toBeNull();
    expect(strip?.children).toHaveLength(SKELETON_CELLS);
  });
});
