import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen, within } from "@test/test-utils";

import { Anniversaries } from "../Anniversaries/Anniversaries";
import { Gaps } from "../Gaps/Gaps";
import { Landed } from "../Landed/Landed";
import { NewInLibrary } from "../NewInLibrary/NewInLibrary";
import { ServerPlaylists } from "../ServerPlaylists/ServerPlaylists";

const mocks = vi.hoisted(() => ({
  recentAlbums: vi.fn(),
  gaps: vi.fn(),
  anniversaries: vi.fn(),
  serverPlaylists: vi.fn(),
  targets: vi.fn(),
  playEntity: vi.fn(),
  openForTarget: vi.fn(),
  openForResult: vi.fn(),
  requestResult: vi.fn(),
}));

vi.mock("@hooks/api/queries/analytics/useRecentAlbums", () => ({ useRecentAlbums: () => mocks.recentAlbums() }));
vi.mock("@hooks/api/queries/analytics/useDiscographyGaps", () => ({ useDiscographyGaps: () => mocks.gaps() }));
vi.mock("@hooks/api/queries/analytics/useAnniversaries", () => ({ useAnniversaries: () => mocks.anniversaries() }));
vi.mock("@hooks/api/queries/analytics/useServerPlaylists", () => ({
  useServerPlaylists: () => mocks.serverPlaylists(),
}));
vi.mock("@hooks/api/queries/usePlaylistSyncTargets", () => ({ usePlaylistSyncTargets: () => mocks.targets() }));
vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity: mocks.playEntity }) }));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({
    openForTarget: mocks.openForTarget,
    openForResult: mocks.openForResult,
    requestResult: mocks.requestResult,
  }),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

function ready<T>(data: T) {
  return { data, isLoading: false, isError: false };
}

const ALBUM = {
  albumExternalId: "ext1",
  name: "Ten",
  artist: "Pearl Jam",
  cover: null,
  tracks: 11,
  landedAt: new Date(),
  source: "usenet",
  minutes: 90,
  played: false,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("NewInLibrary", () => {
  it("lists what landed with whether it was played, opens an album when picked and plays it from its cover", () => {
    mocks.recentAlbums.mockReturnValue(
      ready([ALBUM, { ...ALBUM, albumExternalId: "ext2", name: "Vs", played: true, source: null, minutes: null }])
    );
    renderWithProviders(<NewInLibrary size="M" info="x" />);

    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Ten");
    expect(rows[0]).toHaveTextContent("Pearl Jam · 11 tracks");
    expect(rows[0]).toHaveTextContent("New");
    expect(rows[1]).toHaveTextContent("Played");

    fireEvent.click(within(rows[0]).getByRole("button", { name: /^Ten/ }));
    expect(mocks.openForResult).toHaveBeenCalledWith(expect.objectContaining({ type: "album", id: "ext1" }));
    expect(mocks.playEntity).not.toHaveBeenCalled();

    fireEvent.click(within(rows[0]).getByRole("button", { name: "Play Ten" }));
    expect(mocks.playEntity).toHaveBeenCalledWith({ kind: "album", albumExternalId: "ext1" });
  });

  it("says when nothing landed", () => {
    mocks.recentAlbums.mockReturnValue(ready([]));
    renderWithProviders(<NewInLibrary size="M" info="x" />);

    expect(screen.getByText("Nothing new in the last 7 days.")).toBeInTheDocument();
  });
});

describe("Landed", () => {
  it("keeps only downloaded albums and names their source and time", () => {
    mocks.recentAlbums.mockReturnValue(
      ready([ALBUM, { ...ALBUM, albumExternalId: "scan", name: "Scanned", source: null, minutes: null }])
    );
    renderWithProviders(<Landed size="M" info="x" />);

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getByText("Usenet")).toBeInTheDocument();
    expect(within(rows[0]).getByText("in 1h")).toBeInTheDocument();

    fireEvent.click(within(rows[0]).getByRole("button", { name: "Play Ten" }));
    expect(mocks.playEntity).toHaveBeenCalledWith({ kind: "album", albumExternalId: "ext1" });
  });

  it("says when no download landed", () => {
    mocks.recentAlbums.mockReturnValue(ready([{ ...ALBUM, source: null, minutes: null }]));
    renderWithProviders(<Landed size="M" info="x" />);

    expect(screen.getByText("No downloads landed in the last 7 days.")).toBeInTheDocument();
  });
});

describe("Gaps", () => {
  const gap = (artist: string) => ({
    artist,
    artistId: `${artist}-id`,
    cover: null,
    have: 1,
    total: 4,
    missing: [{ id: `${artist}-vs`, name: "Vs", artist, cover: null, year: 1993 }],
  });

  it("lays every artist on a horizontal rail at any size, scrollable from the keyboard", () => {
    mocks.gaps.mockReturnValue(ready([gap("Pearl Jam"), gap("Tycho")]));
    renderWithProviders(<Gaps size="M" info="x" />);

    expect(screen.getByText("Tycho")).toBeInTheDocument();
    expect(screen.getAllByText("1 of 4 releases")).toHaveLength(2);
    expect(screen.getAllByText("25%")).toHaveLength(2);
    expect(screen.getByRole("region", { name: "All artists, scroll sideways" })).toHaveAttribute("tabindex", "0");
  });

  it("opens the artist from its progress header", () => {
    mocks.gaps.mockReturnValue(ready([gap("Pearl Jam")]));
    renderWithProviders(<Gaps size="M" info="x" />);

    fireEvent.click(screen.getByRole("button", { name: "Open Pearl Jam" }));

    expect(mocks.openForTarget).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "artist", id: "Pearl Jam-id", name: "Pearl Jam" })
    );
  });

  it("opens a missing album from its row and requests it from its cover", () => {
    mocks.gaps.mockReturnValue(ready([gap("Pearl Jam")]));
    renderWithProviders(<Gaps size="M" info="x" />);

    fireEvent.click(screen.getByRole("button", { name: /^Vs/ }));
    expect(mocks.openForTarget).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "album", id: "Pearl Jam-vs", name: "Vs", artistName: "Pearl Jam" })
    );

    fireEvent.click(screen.getByRole("button", { name: "Request Vs" }));
    expect(mocks.requestResult).toHaveBeenCalledWith(expect.objectContaining({ type: "album", id: "Pearl Jam-vs" }));
  });
});

describe("Anniversaries", () => {
  it("names the release date and the years since", () => {
    mocks.anniversaries.mockReturnValue(
      ready([
        {
          albumExternalId: "e1",
          name: "Homogenic",
          artist: "Bjork",
          cover: null,
          releaseDate: "1997-10-20",
          years: 29,
        },
      ])
    );
    renderWithProviders(<Anniversaries size="M" info="x" />);

    expect(screen.getByRole("listitem")).toHaveTextContent("29 years");
    expect(screen.getByRole("listitem")).toHaveTextContent("Bjork · released");
  });
});

describe("ServerPlaylists", () => {
  it("marks each connected server as synced or not for every playlist", () => {
    mocks.targets.mockReturnValue(
      ready([
        { server: "plex", name: "Plex" },
        { server: "jellyfin", name: "Jellyfin" },
      ])
    );
    mocks.serverPlaylists.mockReturnValue(
      ready([
        { id: "p1", name: "Road trip", cover: null, tracks: 12, links: [{ server: "plex", syncedAt: new Date() }] },
      ])
    );
    renderWithProviders(<ServerPlaylists size="L" info="x" />);

    const row = screen.getByRole("listitem");
    expect(row).toHaveTextContent("12 tracks");
    expect(within(row).getByText("Plex")).toHaveTextContent("Synced");
    expect(within(row).getByText("Jellyfin")).toHaveTextContent("Not synced");

    fireEvent.click(within(row).getByRole("button", { name: /^Road trip/ }));
    expect(mocks.openForTarget).toHaveBeenCalledWith(expect.objectContaining({ mode: "playlist", id: "p1" }));

    fireEvent.click(within(row).getByRole("button", { name: "Play Road trip" }));
    expect(mocks.playEntity).toHaveBeenCalledWith({ kind: "playlist", playlistId: "p1" });
  });

  it("asks for a media server when none is connected", () => {
    mocks.targets.mockReturnValue(ready([]));
    mocks.serverPlaylists.mockReturnValue(ready([]));
    renderWithProviders(<ServerPlaylists size="L" info="x" />);

    expect(screen.getByText("Connect a media server to sync playlists.")).toBeInTheDocument();
  });
});

describe("a library widget that fails to load", () => {
  const failed = { data: undefined, isLoading: false, isError: true };

  it.each([
    ["New in your library", () => <NewInLibrary size="M" info="x" />],
    ["Landed this week", () => <Landed size="M" info="x" />],
    ["Complete the discography", () => <Gaps size="L" info="x" />],
    ["Anniversaries", () => <Anniversaries size="M" info="x" />],
    ["Your playlists on media servers", () => <ServerPlaylists size="L" info="x" />],
  ])("%s says it could not load, without blaming the listening history", (_name, widget) => {
    mocks.recentAlbums.mockReturnValue(failed);
    mocks.gaps.mockReturnValue(failed);
    mocks.anniversaries.mockReturnValue(failed);
    mocks.serverPlaylists.mockReturnValue(failed);
    mocks.targets.mockReturnValue(ready([]));
    renderWithProviders(widget());

    expect(screen.getByText("Couldn't load this right now.")).toBeInTheDocument();
    expect(screen.queryByText("Couldn't load your listening history.")).not.toBeInTheDocument();
  });
});
