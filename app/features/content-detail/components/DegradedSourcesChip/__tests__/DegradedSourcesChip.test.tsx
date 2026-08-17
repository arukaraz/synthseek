import { describe, expect, it } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { DegradedSource } from "../../../types";
import { DegradedSourcesChip } from "../DegradedSourcesChip";

function reachable(source: string): DegradedSource {
  return { source, unavailableForSeconds: null };
}

describe("DegradedSourcesChip", () => {
  it("renders nothing when no sources are degraded", () => {
    const { container } = renderWithProviders(<DegradedSourcesChip sources={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the chip when a single source is degraded", () => {
    renderWithProviders(<DegradedSourcesChip sources={[reachable("lastfm")]} />);

    expect(screen.getByRole("button", { name: "Some sources unavailable" })).toBeInTheDocument();
  });

  it("lists the mapped provider display names in the tooltip", async () => {
    const { user } = renderWithProviders(
      <DegradedSourcesChip sources={[reachable("coverartarchive"), reachable("fanart"), reachable("lastfm")]} />
    );

    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("These sources could not be reached:");
    expect(tooltip).toHaveTextContent("Cover Art Archive");
    expect(tooltip).toHaveTextContent("fanart.tv");
    expect(tooltip).toHaveTextContent("Last.fm");
  });

  it("falls back to a capitalized raw id for an unknown source", async () => {
    const { user } = renderWithProviders(<DegradedSourcesChip sources={[reachable("someprovider")]} />);

    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Someprovider");
  });

  it("says how long a provider marked unavailable has been down", async () => {
    const { user } = renderWithProviders(
      <DegradedSourcesChip sources={[{ source: "lastfm", unavailableForSeconds: 245 }]} />
    );

    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Last.fm · down 4m");
  });

  it("reports an outage under a minute in seconds", async () => {
    const { user } = renderWithProviders(
      <DegradedSourcesChip sources={[{ source: "discogs", unavailableForSeconds: 12 }]} />
    );

    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Discogs · down 12s");
  });

  it("reports an outage past the hour in hours", async () => {
    const { user } = renderWithProviders(
      <DegradedSourcesChip sources={[{ source: "wikidata", unavailableForSeconds: 7_500 }]} />
    );

    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Wikidata · down 2h");
  });

  it("omits the duration for a source with no recorded outage", async () => {
    const { user } = renderWithProviders(<DegradedSourcesChip sources={[reachable("songlink")]} />);

    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Songlink");
    expect(tooltip).not.toHaveTextContent("down");
  });
});
