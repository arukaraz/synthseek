import { describe, it, expect } from "vitest";

import { ContentType } from "@api/__generated__/types";
import { renderWithProviders, screen } from "@test/test-utils";

import { ConfigHeader } from "../ConfigHeader";

describe("ConfigHeader", () => {
  it("renders the content-type badge, title and artist", () => {
    renderWithProviders(
      <ConfigHeader name="Discovery" artist="Daft Punk" itemType={ContentType.enum.album} year="2001" />
    );

    expect(screen.getByText("Album")).toBeInTheDocument();
    expect(screen.getByText("Discovery")).toBeInTheDocument();
    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
    expect(screen.getByText("2001")).toBeInTheDocument();
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

  it("shows the album name only for track items", () => {
    renderWithProviders(
      <ConfigHeader name="One More Time" artist="Daft Punk" albumName="Discovery" itemType={ContentType.enum.track} />
    );

    expect(screen.getByText("Discovery")).toBeInTheDocument();
  });

  it("does not show the album name for non-track items", () => {
    renderWithProviders(
      <ConfigHeader name="Discovery" albumName="Should Not Show" itemType={ContentType.enum.album} />
    );

    expect(screen.queryByText("Should Not Show")).not.toBeInTheDocument();
  });

  it("renders a pluralized track count when provided", () => {
    renderWithProviders(<ConfigHeader name="Discovery" totalTracks={14} itemType={ContentType.enum.album} />);

    expect(screen.getByText("14 tracks")).toBeInTheDocument();
  });
});
