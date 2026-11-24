import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";

const api = vi.hoisted(() => ({
  artistStats: undefined as Record<string, unknown> | undefined,
  artistStatsLoading: false,
  artistStatsArgs: vi.fn(),
  identity: undefined as Record<string, unknown> | undefined,
  identityArgs: vi.fn(),
  discography: undefined as Record<string, unknown> | undefined,
  albumStats: undefined as Record<string, unknown> | undefined,
  albumStatsLoading: false,
  albumStatsArgs: vi.fn(),
  album: undefined as Record<string, unknown> | undefined,
  albumArgs: vi.fn(),
}));

vi.mock("@hooks/api/queries/content-detail", () => ({
  useArtistStats: (args: unknown) => {
    api.artistStatsArgs(args);
    return { data: api.artistStats, isLoading: api.artistStatsLoading };
  },
  useArtistIdentity: (args: unknown) => {
    api.identityArgs(args);
    return { data: api.identity };
  },
  useArtistDiscography: () => ({ data: api.discography }),
  useAlbumStats: (args: unknown) => {
    api.albumStatsArgs(args);
    return { data: api.albumStats, isLoading: api.albumStatsLoading };
  },
  useAlbumDetail: (args: unknown) => {
    api.albumArgs(args);
    return { data: api.album };
  },
}));

import { AlbumStatsWidget } from "../AlbumStatsWidget";
import { ArtistStatsWidget } from "../ArtistStatsWidget";

beforeEach(() => {
  vi.clearAllMocks();
  api.artistStats = undefined;
  api.artistStatsLoading = false;
  api.identity = undefined;
  api.discography = undefined;
  api.albumStats = undefined;
  api.albumStatsLoading = false;
  api.album = undefined;
});

describe("the artist's figures", () => {
  function renderStats() {
    render(<ArtistStatsWidget catalogArtistId="artist-1" artistName="Daft Punk" mbid="mbid-1" slot="stats" />);
    return userEvent.setup();
  }

  it("asks for the figures by the catalog id, the name and the MusicBrainz id", () => {
    renderStats();

    expect(api.artistStatsArgs).toHaveBeenCalledWith({
      artistName: "Daft Punk",
      mbid: "mbid-1",
      catalogArtistId: "artist-1",
    });
  });

  it("leads with Last.fm and lists the catalog's fans and ListenBrainz behind the figure", async () => {
    api.artistStats = { lastfm: { listeners: 1200, plays: 9800 }, listenbrainz: { listeners: 310, plays: 4100 } };
    api.identity = { catalogFans: { provider: "Deezer", fans: 5600 } };
    const user = renderStats();

    expect(screen.getByRole("button", { name: /Listeners/ })).toHaveTextContent("1,200");
    await user.click(screen.getByRole("button", { name: /Listeners/ }));

    const panel = screen.getByRole("group", { name: "Listeners by source" });
    expect([...panel.querySelectorAll("[data-source-badge]")].map((badge) => badge.textContent)).toEqual([
      "Last.fm",
      "Deezer",
      "ListenBrainz",
    ]);
  });

  it("falls back to the catalog's fans when Last.fm is not active", () => {
    api.artistStats = { lastfm: null, listenbrainz: null };
    api.identity = { catalogFans: { provider: "Deezer", fans: 5600 } };
    renderStats();

    expect(screen.getByRole("button", { name: /Fans/ })).toHaveTextContent("5,600");
  });

  it("draws a placeholder instead of figures while they load", () => {
    api.artistStatsLoading = true;
    renderStats();

    expect(screen.queryByText("In library")).not.toBeInTheDocument();
  });
});

describe("the artist's biography", () => {
  function renderAbout() {
    render(<ArtistStatsWidget catalogArtistId="artist-1" artistName="Daft Punk" mbid={null} slot="about" />);
  }

  it("shows the text with a link to the Wikipedia article it came from", () => {
    api.artistStats = { bio: { text: "A French electronic duo.", url: "https://en.wikipedia.org/wiki/Daft_Punk" } };
    renderAbout();

    expect(screen.getByText("A French electronic duo.")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Read on Wikipedia" });
    expect(link).toHaveAttribute("href", "https://en.wikipedia.org/wiki/Daft_Punk");
    expect(link.querySelector("[data-source-badge]")).toHaveTextContent("Wikipedia");
  });

  it("offers no link when there is no biography", () => {
    api.artistStats = { bio: null };
    renderAbout();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("leaves the identity alone, which only the figures need", () => {
    renderAbout();

    expect(api.identityArgs).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });
});

describe("the album's figures and description", () => {
  it("shows Last.fm's figures with the track count as a plain figure", () => {
    api.albumStats = { lastfm: { listeners: 800, plays: 6400 }, listenbrainz: null, description: null };
    api.album = { catalogFans: { provider: "Deezer", fans: 90 } };
    render(
      <AlbumStatsWidget
        catalogAlbumId="album-1"
        artistName="Daft Punk"
        albumName="Discovery"
        trackCount={14}
        slot="stats"
      />
    );

    expect(api.albumArgs).toHaveBeenCalledWith({ catalogAlbumId: "album-1", enabled: true });
    expect(api.albumStatsArgs).toHaveBeenCalledWith({
      artistName: "Daft Punk",
      albumName: "Discovery",
      catalogAlbumId: "album-1",
    });
    expect(screen.getByRole("button", { name: /Listeners/ })).toHaveTextContent("800");
    expect(screen.getByRole("button", { name: /Plays/ })).toHaveTextContent("6,400");
    expect(screen.getByText("Tracks").parentElement).toHaveTextContent("14");
  });

  it("shows the description as plain text, with no source link", () => {
    api.albumStats = { lastfm: null, listenbrainz: null, description: "The second studio album." };
    render(
      <AlbumStatsWidget
        catalogAlbumId="album-1"
        artistName="Daft Punk"
        albumName="Discovery"
        trackCount={14}
        slot="about"
      />
    );

    expect(screen.getByText("The second studio album.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(api.albumArgs).toHaveBeenCalledWith({ catalogAlbumId: "album-1", enabled: false });
  });
});
