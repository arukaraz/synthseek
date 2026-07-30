import { describe, expect, it } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import { DegradedSourcesChip } from "../DegradedSourcesChip";

describe("DegradedSourcesChip", () => {
  it("renders nothing when no sources are degraded", () => {
    const { container } = renderWithProviders(<DegradedSourcesChip sources={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the chip when a single source is degraded", () => {
    renderWithProviders(<DegradedSourcesChip sources={["lastfm"]} />);

    expect(screen.getByRole("button", { name: "Some sources unavailable" })).toBeInTheDocument();
  });

  it("lists the mapped provider display names in the tooltip", async () => {
    const { user } = renderWithProviders(<DegradedSourcesChip sources={["coverartarchive", "fanart", "lastfm"]} />);

    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("These sources could not be reached:");
    expect(tooltip).toHaveTextContent("Cover Art Archive");
    expect(tooltip).toHaveTextContent("fanart.tv");
    expect(tooltip).toHaveTextContent("Last.fm");
  });

  it("falls back to a capitalized raw id for an unknown source", async () => {
    const { user } = renderWithProviders(<DegradedSourcesChip sources={["someprovider"]} />);

    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Someprovider");
  });
});
