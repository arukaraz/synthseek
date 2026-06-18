import { describe, it, expect, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryArtistItem } from "@hooks/api/queries/library/types";

import { ArtistCard } from "../ArtistCard";

function createLibraryArtist(overrides?: Partial<LibraryArtistItem>): LibraryArtistItem {
  return {
    artist: "Daft Punk",
    trackCount: 42,
    albumCount: 6,
    albumArt: null,
    genre: "electronic",
    ...overrides,
  };
}

describe("ArtistCard", () => {
  it("is presentational with no button semantics when onOpen is absent", () => {
    renderWithProviders(<ArtistCard item={createLibraryArtist()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
  });

  it("opens the detail flow on click when onOpen is provided", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<ArtistCard item={createLibraryArtist()} onOpen={onOpen} />);

    await user.click(screen.getByRole("button"));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("activates with Enter and Space when interactive", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<ArtistCard item={createLibraryArtist()} onOpen={onOpen} />);

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it("prefers the resolved image over the albumArt fallback", () => {
    const { container } = renderWithProviders(
      <ArtistCard
        item={createLibraryArtist({ albumArt: "https://example.com/album.jpg" })}
        image="https://example.com/artist.jpg"
      />
    );

    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toContain("artist.jpg");
  });

  it("falls back to albumArt when no resolved image is available", () => {
    const { container } = renderWithProviders(
      <ArtistCard item={createLibraryArtist({ albumArt: "https://example.com/album.jpg" })} image={null} />
    );

    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toContain("album.jpg");
  });

  it("shows the initials placeholder while the artist image is resolving, never the albumArt", () => {
    const { container } = renderWithProviders(
      <ArtistCard item={createLibraryArtist({ albumArt: "https://example.com/album.jpg" })} image={null} isResolving />
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("DP")).toBeInTheDocument();
  });

  it("swaps to the resolved image once resolving finishes", () => {
    const { container } = renderWithProviders(
      <ArtistCard
        item={createLibraryArtist({ albumArt: "https://example.com/album.jpg" })}
        image="https://example.com/artist.jpg"
        isResolving={false}
      />
    );

    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toContain("artist.jpg");
  });
});
