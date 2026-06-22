import { describe, it, expect } from "vitest";

import { render, screen } from "@test/test-utils";

import { TrackMetaCell } from "../TrackMetaCell";

describe("TrackMetaCell", () => {
  it("shows both the artist and the album when an album name is present", () => {
    render(<TrackMetaCell artist="Daft Punk" albumName="Discovery" />);

    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
    expect(screen.getByText("Discovery")).toBeInTheDocument();
  });

  it("shows only the artist when the album name is empty", () => {
    render(<TrackMetaCell artist="Daft Punk" albumName="" />);

    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
    expect(screen.queryByText("Discovery")).not.toBeInTheDocument();
  });
});
