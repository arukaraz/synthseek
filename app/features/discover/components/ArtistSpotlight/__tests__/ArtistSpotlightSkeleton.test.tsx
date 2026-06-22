import { describe, expect, it } from "vitest";

import { render } from "@test/test-utils";

import { ArtistSpotlightSkeleton } from "../ArtistSpotlightSkeleton";
import { ARTIST_SPOTLIGHT_COUNT } from "../constants";

describe("ArtistSpotlightSkeleton", () => {
  it("renders one pulsing placeholder per spotlight slot", () => {
    const { container } = render(<ArtistSpotlightSkeleton />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(ARTIST_SPOTLIGHT_COUNT);
  });
});
