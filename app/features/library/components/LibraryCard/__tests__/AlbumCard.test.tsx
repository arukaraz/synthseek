import { describe, it, expect, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryAlbumItem } from "@hooks/api/queries/library/types";

import { AlbumCard } from "../AlbumCard";

function createLibraryAlbum(overrides?: Partial<LibraryAlbumItem>): LibraryAlbumItem {
  return {
    id: "row-1",
    external_id: "ext-1",
    name: "Discovery",
    artist: "Daft Punk",
    album_art: null,
    status: "complete",
    total_tracks: 14,
    completed_tracks: 14,
    source_provider: null,
    release_date: "2001-03-12",
    genres: ["electronic"],
    year: 2001,
    quality: "FLAC",
    requested: true,
    created_at: new Date("2001-03-12T00:00:00.000Z"),
    ...overrides,
  };
}

describe("AlbumCard", () => {
  it("is presentational with no button semantics when onOpen is absent", () => {
    renderWithProviders(<AlbumCard item={createLibraryAlbum()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Discovery")).toBeInTheDocument();
  });

  it("opens the detail flow on click when onOpen is provided", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<AlbumCard item={createLibraryAlbum()} onOpen={onOpen} />);

    await user.click(screen.getByRole("button"));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("activates with Enter and Space when interactive", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<AlbumCard item={createLibraryAlbum()} onOpen={onOpen} />);

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
