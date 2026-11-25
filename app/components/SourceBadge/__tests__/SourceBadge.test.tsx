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

  it("draws a source that is not working as a dashed, dimmed pill, and only that one", () => {
    render(
      <>
        <SourceBadge source="lastfm" label="Last.fm" inactive />
        <SourceBadge source="plex" label="Plex" />
      </>
    );

    const inactive = screen.getByText("Last.fm");
    expect(inactive).toHaveAttribute("data-inactive", "true");
    expect(inactive).toHaveClass("border-dashed");
    const active = screen.getByText("Plex");
    expect(active).not.toHaveAttribute("data-inactive");
    expect(active).not.toHaveClass("border-dashed");
  });

  it("takes the catalog's label from its caller, which knows what the catalog is", () => {
    render(<SourceBadge source="catalog" label="Deezer" />);

    expect(screen.getByText("Deezer")).toHaveAttribute("data-source-badge", "catalog");
  });
});
