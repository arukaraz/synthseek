import { describe, it, expect } from "vitest";

import { ContentType } from "@api/__generated__/types";
import { renderWithProviders, screen } from "@test/test-utils";

import { ConfigHeader } from "../ConfigHeader";

describe("ConfigHeader", () => {
  it("renders the content-type badge, the title and one meta line", () => {
    renderWithProviders(
      <ConfigHeader
        name="Discovery"
        artist="Daft Punk"
        itemType={ContentType.enum.album}
        year="2001"
        totalTracks={14}
      />
    );

    expect(screen.getByText("Album")).toBeInTheDocument();
    expect(screen.getByText("Discovery")).toBeInTheDocument();
    expect(screen.getByText("Daft Punk · 2001 · 14 tracks")).toBeInTheDocument();
  });

  it("renders the cover image when one is provided", () => {
    renderWithProviders(
      <ConfigHeader name="Discovery" image="https://img/discovery.jpg" itemType={ContentType.enum.album} />
    );

    expect(screen.getByRole("img", { name: "Discovery" })).toBeInTheDocument();
  });

  it("renders the placeholder icon when there is no image", () => {
    const { container } = renderWithProviders(<ConfigHeader name="Discovery" itemType={ContentType.enum.album} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("puts the album name in the meta line only for track items", () => {
    renderWithProviders(
      <ConfigHeader name="One More Time" artist="Daft Punk" albumName="Discovery" itemType={ContentType.enum.track} />
    );

    expect(screen.getByText("Daft Punk · Discovery")).toBeInTheDocument();
  });

  it("does not show the album name for non-track items", () => {
    renderWithProviders(
      <ConfigHeader name="Discovery" albumName="Should Not Show" itemType={ContentType.enum.album} />
    );

    expect(screen.queryByText(/Should Not Show/)).not.toBeInTheDocument();
  });

  it("leaves the meta line out when there is nothing to show", () => {
    const { container } = renderWithProviders(<ConfigHeader name="Discovery" itemType={ContentType.enum.album} />);

    expect(container.querySelector("p")).toBeNull();
  });
});
