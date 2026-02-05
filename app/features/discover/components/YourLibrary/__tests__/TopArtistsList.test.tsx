import { describe, it, expect } from "vitest";
import { render, screen } from "@test/test-utils";
import { TopArtistsList } from "../TopArtistsList";

describe("TopArtistsList", () => {
  const mockArtists = [
    { artist: "Artist One", trackCount: 15 },
    { artist: "Artist Two", trackCount: 10 },
    { artist: "Artist Three", trackCount: 5 },
  ];

  it("renders list of artists with track counts", () => {
    render(<TopArtistsList artists={mockArtists} />);

    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Artist Two")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Artist Three")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders Artist Breakdown header", () => {
    render(<TopArtistsList artists={mockArtists} />);

    expect(screen.getByText("Artist Breakdown")).toBeInTheDocument();
  });

  it("renders crown icon", () => {
    const { container } = render(<TopArtistsList artists={mockArtists} />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("returns null when artists array is empty", () => {
    const { container } = render(<TopArtistsList artists={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders all artists in the list", () => {
    const manyArtists = Array.from({ length: 10 }, (_, i) => ({
      artist: `Artist ${i + 1}`,
      trackCount: 10 - i,
    }));

    render(<TopArtistsList artists={manyArtists} />);

    manyArtists.forEach((artist) => {
      expect(screen.getByText(artist.artist)).toBeInTheDocument();
    });
  });

  it("handles single artist", () => {
    render(<TopArtistsList artists={[{ artist: "Solo Artist", trackCount: 42 }]} />);

    expect(screen.getByText("Solo Artist")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
