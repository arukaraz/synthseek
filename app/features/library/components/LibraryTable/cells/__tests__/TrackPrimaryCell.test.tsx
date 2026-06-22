import { describe, it, expect } from "vitest";

import { render, screen } from "@test/test-utils";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

import { TrackPrimaryCell } from "../TrackPrimaryCell";

function createTrack(overrides?: Partial<LibraryTrackItem>): LibraryTrackItem {
  return {
    id: "trk-1",
    external_id: "ext-1",
    title: "Harder, Better, Faster, Stronger",
    artist: "Daft Punk",
    status: "complete",
    source: "deezer",
    format: "flac",
    request_type: "track",
    bitrate: 1411,
    duration_ms: 224000,
    track_number: 4,
    disc_number: 1,
    explicit: false,
    album_id: "alb-1",
    albumName: "Discovery",
    albumArt: null,
    genres: ["electronic"],
    playlistIds: [],
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    completed_at: null,
    ...overrides,
  };
}

describe("TrackPrimaryCell", () => {
  it("renders the track title", () => {
    render(<TrackPrimaryCell item={createTrack()} />);

    expect(screen.getByText("Harder, Better, Faster, Stronger")).toBeInTheDocument();
  });

  it("renders the artwork image when album art is present", () => {
    const { container } = render(
      <TrackPrimaryCell item={createTrack({ albumArt: "https://example.com/cover.jpg" })} />
    );

    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toContain("cover.jpg");
  });

  it("renders a placeholder instead of an image when album art is absent", () => {
    const { container } = render(<TrackPrimaryCell item={createTrack({ albumArt: null })} />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
