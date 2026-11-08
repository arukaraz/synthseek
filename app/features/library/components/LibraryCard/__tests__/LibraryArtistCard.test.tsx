import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen, userEvent } from "@test/test-utils";
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

  describe("as a list row", () => {
    it("opens the artist from the row and shows the album count with the genre", async () => {
      useArtistImageMock.mockReturnValue({ image: null, isLoading: false });
      const onOpen = vi.fn();
      const user = userEvent.setup();

      render(<LibraryArtistCard item={createArtist()} resolveEnabled variant="row" onOpen={onOpen} />);
      await user.click(screen.getByRole("button", { name: "Open details for Daft Punk" }));

      expect(screen.getByText("6 albums · electronic")).toBeInTheDocument();
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("shows the resolved image, falling back to the album art", () => {
      useArtistImageMock.mockReturnValue({ image: "https://example.com/artist.jpg", isLoading: false });
      const { container, rerender } = render(
        <LibraryArtistCard
          item={createArtist({ albumArt: "https://example.com/album.jpg" })}
          resolveEnabled
          variant="row"
        />
      );
      expect(container.querySelector("img")?.getAttribute("src")).toContain("artist.jpg");

      useArtistImageMock.mockReturnValue({ image: null, isLoading: false });
      rerender(
        <LibraryArtistCard
          item={createArtist({ albumArt: "https://example.com/album.jpg" })}
          resolveEnabled
          variant="row"
        />
      );
      expect(container.querySelector("img")?.getAttribute("src")).toContain("album.jpg");
    });

    it("shows the initials while the image resolves", () => {
      useArtistImageMock.mockReturnValue({ image: null, isLoading: true });
      const { container } = render(
        <LibraryArtistCard
          item={createArtist({ albumArt: "https://example.com/album.jpg" })}
          resolveEnabled
          variant="row"
        />
      );

      expect(container.querySelector("img")).not.toBeInTheDocument();
      expect(screen.getByText("DP")).toBeInTheDocument();
    });

    it("offers a shuffle only when the artist can be played", () => {
      useArtistImageMock.mockReturnValue({ image: null, isLoading: false });
      const { rerender } = render(<LibraryArtistCard item={createArtist()} resolveEnabled variant="row" />);
      expect(screen.queryByRole("button", { name: "Shuffle everything we have of Daft Punk" })).not.toBeInTheDocument();

      rerender(
        <LibraryArtistCard item={createArtist()} resolveEnabled variant="row" onPlay={vi.fn(async () => undefined)} />
      );
      expect(screen.getByRole("button", { name: "Shuffle everything we have of Daft Punk" })).toBeInTheDocument();
    });
  });
});
