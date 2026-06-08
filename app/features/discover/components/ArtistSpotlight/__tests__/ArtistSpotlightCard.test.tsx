import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { ArtistSpotlightCard } from "../ArtistSpotlightCard";
import type { ArtistSpotlightCardProps } from "../types";

type Artist = ArtistSpotlightCardProps["artist"];
type LatestAlbum = NonNullable<ArtistSpotlightCardProps["latestAlbum"]>;

const createArtist = (overrides: Partial<Artist> = {}): Artist => ({
  id: "artist-1",
  name: "Test Artist",
  images: [],
  ...overrides,
});

const createAlbum = (overrides: Partial<LatestAlbum> = {}): LatestAlbum => ({
  id: "album-1",
  name: "Test Album",
  images: [],
  total_tracks: 12,
  ...overrides,
});

describe("ArtistSpotlightCard", () => {
  it("renders the pluralized song count when total_tracks is available", () => {
    render(<ArtistSpotlightCard artist={createArtist()} latestAlbum={createAlbum({ total_tracks: 12 })} />);

    expect(screen.getByText("12 Songs")).toBeInTheDocument();
  });

  it("renders the singular form for a single track", () => {
    render(<ArtistSpotlightCard artist={createArtist()} latestAlbum={createAlbum({ total_tracks: 1 })} />);

    expect(screen.getByText("1 Song")).toBeInTheDocument();
  });

  it("hides the song count and never renders the raw i18n key when total_tracks is missing", () => {
    const album = createAlbum();
    Reflect.deleteProperty(album, "total_tracks");

    render(<ArtistSpotlightCard artist={createArtist()} latestAlbum={album} />);

    expect(screen.queryByText("artistSpotlight.songs")).not.toBeInTheDocument();
    expect(screen.getByText("Test Album")).toBeInTheDocument();
  });

  it("hides the song count when total_tracks is zero (unknown sentinel)", () => {
    render(<ArtistSpotlightCard artist={createArtist()} latestAlbum={createAlbum({ total_tracks: 0 })} />);

    expect(screen.queryByText("artistSpotlight.songs")).not.toBeInTheDocument();
    expect(screen.queryByText("0 Songs")).not.toBeInTheDocument();
  });

  it("renders the no-albums copy when there is no latest album", () => {
    render(<ArtistSpotlightCard artist={createArtist()} latestAlbum={null} />);

    expect(screen.getByText("No albums available")).toBeInTheDocument();
  });

  it("invokes onClick when the card is pressed", () => {
    const onClick = vi.fn();
    render(<ArtistSpotlightCard artist={createArtist({ name: "Clickable" })} latestAlbum={null} onClick={onClick} />);

    fireEvent.click(screen.getByText("Clickable"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
