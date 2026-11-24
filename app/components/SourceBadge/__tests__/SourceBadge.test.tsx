import { describe, expect, it } from "vitest";

import { render, screen } from "@test/test-utils";

import { SOURCE_NAMES } from "../constants";
import { SourceBadge } from "../SourceBadge";

describe("SourceBadge", () => {
  it("names the third party and colours its dot by the source, hidden from a screen reader", () => {
    render(<SourceBadge source="listenbrainz" label={SOURCE_NAMES.listenbrainz} />);

    const badge = screen.getByText("ListenBrainz");
    expect(badge).toHaveAttribute("data-source-badge", "listenbrainz");
    const dot = badge.querySelector("[data-source]");
    expect(dot).toHaveAttribute("data-source", "listenbrainz");
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot).toHaveClass("source-dot");
  });

  it("takes the catalog's label from its caller, which knows what the catalog is", () => {
    render(<SourceBadge source="catalog" label="Deezer" />);

    expect(screen.getByText("Deezer")).toHaveAttribute("data-source-badge", "catalog");
  });
});
