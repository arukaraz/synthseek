import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen } from "@test/test-utils";
import type { LibraryArtistItem } from "@hooks/api/queries/library/types";

const useArtistImageMock = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api/queries/content-detail", () => ({
  useArtistImage: useArtistImageMock,
}));

import { LibraryArtistCard } from "../LibraryArtistCard";

function createArtist(overrides?: Partial<LibraryArtistItem>): LibraryArtistItem {
  return {
    artist: "Daft Punk",
    trackCount: 42,
    albumCount: 6,
    albumArt: null,
    genre: "electronic",
    ...overrides,
  };
}

describe("LibraryArtistCard", () => {
  beforeEach(() => {
    useArtistImageMock.mockReset();
  });

  it("passes the resolved image through to the card", () => {
    useArtistImageMock.mockReturnValue({ image: "https://example.com/artist.jpg", isLoading: false });

    const { container } = render(<LibraryArtistCard item={createArtist()} resolveEnabled />);

    expect(container.querySelector("img")?.getAttribute("src")).toContain("artist.jpg");
  });

  it("requests the artist image gated by the resolveEnabled flag", () => {
    useArtistImageMock.mockReturnValue({ image: null, isLoading: false });

    render(<LibraryArtistCard item={createArtist()} resolveEnabled={false} />);

    expect(useArtistImageMock).toHaveBeenCalledWith("Daft Punk", false);
  });

  it("renders the initials placeholder while the image is resolving", () => {
    useArtistImageMock.mockReturnValue({ image: null, isLoading: true });

    const { container } = render(
      <LibraryArtistCard item={createArtist({ albumArt: "https://example.com/album.jpg" })} resolveEnabled />
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("DP")).toBeInTheDocument();
  });
});
