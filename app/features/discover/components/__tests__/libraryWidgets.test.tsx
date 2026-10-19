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
  useContentRequestFlow: () => ({ openForTarget: mocks.openForTarget, openForResult: vi.fn() }),
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
  it("lists what landed with whether it was played, and plays an album when picked", () => {
    mocks.recentAlbums.mockReturnValue(
      ready([ALBUM, { ...ALBUM, albumExternalId: "ext2", name: "Vs", played: true, source: null, minutes: null }])
    );
    renderWithProviders(<NewInLibrary size="M" info="x" />);

    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Ten");
    expect(rows[0]).toHaveTextContent("Pearl Jam · 11 tracks");
    expect(rows[0]).toHaveTextContent("New");
    expect(rows[1]).toHaveTextContent("Played");

    fireEvent.click(within(rows[0]).getByRole("button"));
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
    expect(rows[0]).toHaveTextContent("Usenet · 1h");
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
    cover: null,
    have: 1,
    total: 4,
    missing: [{ id: `${artist}-vs`, name: "Vs", artist, cover: null, year: 1993 }],
  });

  it("shows only the first artist at M and all of them at L", () => {
    mocks.gaps.mockReturnValue(ready([gap("Pearl Jam"), gap("Tycho")]));
    const { unmount } = renderWithProviders(<Gaps size="M" info="x" />);
    expect(screen.queryByText("Tycho")).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<Gaps size="L" info="x" />);
    expect(screen.getByText("Tycho")).toBeInTheDocument();
    expect(screen.getAllByText("1 of 4 releases")).toHaveLength(2);
    expect(screen.getAllByText("25%")).toHaveLength(2);
  });

  it("opens a missing album to request it", () => {
    mocks.gaps.mockReturnValue(ready([gap("Pearl Jam")]));
    renderWithProviders(<Gaps size="M" info="x" />);

    fireEvent.click(screen.getByRole("button", { name: /Vs/ }));

    expect(mocks.openForTarget).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "album", id: "Pearl Jam-vs", name: "Vs", artistName: "Pearl Jam" })
    );
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

    fireEvent.click(within(row).getByRole("button"));
    expect(mocks.openForTarget).toHaveBeenCalledWith(expect.objectContaining({ mode: "playlist", id: "p1" }));
  });

  it("asks for a media server when none is connected", () => {
    mocks.targets.mockReturnValue(ready([]));
    mocks.serverPlaylists.mockReturnValue(ready([]));
    renderWithProviders(<ServerPlaylists size="L" info="x" />);

    expect(screen.getByText("Connect a media server to sync playlists.")).toBeInTheDocument();
  });
});
