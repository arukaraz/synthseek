import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen, within } from "@test/test-utils";

import { Charts } from "../Charts/Charts";
import { ContinueListening } from "../ContinueListening/ContinueListening";
import { LovedNotHere } from "../LovedNotHere/LovedNotHere";
import { Orbit } from "../Orbit/Orbit";
import { Rarities } from "../Rarities/Rarities";

const mocks = vi.hoisted(() => ({
  orbit: vi.fn(),
  charts: vi.fn(),
  loved: vi.fn(),
  rarities: vi.fn(),
  recentPlays: vi.fn(),
  resume: vi.fn(),
  playEntity: vi.fn(),
  openForTarget: vi.fn(),
  openForResult: vi.fn(),
}));

vi.mock("@hooks/api/queries/analytics/useOrbitAlbums", () => ({ useOrbitAlbums: () => mocks.orbit() }));
vi.mock("@hooks/api/queries/analytics/useCharts", () => ({
  useCharts: (country: string) => mocks.charts(country),
}));
vi.mock("@hooks/api/queries/analytics/useLovedNotHere", () => ({ useLovedNotHere: () => mocks.loved() }));
vi.mock("@hooks/api/queries/analytics/useRarities", () => ({ useRarities: () => mocks.rarities() }));
vi.mock("@hooks/api/queries/analytics/useRecentPlays", () => ({
  useRecentPlays: (enabled: boolean) => mocks.recentPlays(enabled),
}));
vi.mock("@hooks/ui/player", () => ({ useResumePoint: () => mocks.resume() }));
vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity: mocks.playEntity }) }));
vi.mock("@modules/providers/CountryProvider", () => ({ useCountry: () => ({ country: "MX" }) }));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget: mocks.openForTarget, openForResult: mocks.openForResult }),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

function ready<T>(data: T) {
  return { data, isLoading: false, isError: false };
}

function catalogTrack(id: string) {
  return {
    type: "track",
    id,
    title: `Track ${id}`,
    artist: "Tycho",
    artists: [],
    album: { id: "al", name: "Awake", images: [{ url: "c.jpg", width: 1, height: 1 }] },
    duration_ms: 1000,
    track_number: 1,
    disc_number: 1,
    isrc: null,
    explicit: false,
    popularity: null,
    preview_url: null,
    images: [],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("Orbit", () => {
  const album = {
    id: "jof",
    name: "Jar of Flies",
    artist: "Alice in Chains",
    cover: null,
    year: null,
    because: "Black",
  };

  it("shows cards at L and opens the album to request it", () => {
    mocks.orbit.mockReturnValue(ready([album]));
    renderWithProviders(<Orbit size="L" info="x" />);

    fireEvent.click(screen.getByRole("button", { name: /Jar of Flies/ }));

    expect(screen.getByText("Because you played Black")).toBeInTheDocument();
    expect(mocks.openForTarget).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "album", id: "jof", artistName: "Alice in Chains" })
    );
  });

  it("keeps the same card rail at M, scrolling sideways", () => {
    mocks.orbit.mockReturnValue(ready([album]));
    renderWithProviders(<Orbit size="M" info="x" />);

    expect(screen.getByRole("region", { name: "Albums in your orbit, scroll sideways" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jar of Flies/ })).toBeInTheDocument();
  });
});

describe("Charts", () => {
  it("asks for the member's country, plays what is owned and requests the rest", () => {
    mocks.charts.mockReturnValue(
      ready([
        { title: "Joga", artist: "Bjork", libraryTrackId: "lib1", track: null },
        { title: "Awake", artist: "Tycho", libraryTrackId: null, track: catalogTrack("c1") },
        { title: "Lost", artist: "Nobody", libraryTrackId: null, track: null },
      ])
    );
    renderWithProviders(<Charts size="M" info="x" />);

    expect(mocks.charts).toHaveBeenCalledWith("MX");
    expect(screen.getByText("Top tracks in Mexico")).toBeInTheDocument();
    const leader = screen.getByRole("article");
    expect(leader).toHaveTextContent("#1 in Mexico");
    fireEvent.click(within(leader).getByRole("button", { name: "Play Joga" }));

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    fireEvent.click(within(rows[0]).getByRole("button", { name: "Request Awake" }));

    expect(mocks.playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["lib1"] });
    expect(mocks.openForResult).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }));
    expect(within(rows[1]).queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("LovedNotHere", () => {
  it("points to settings when no Last.fm account is linked", () => {
    mocks.loved.mockReturnValue(ready({ status: "unlinked" }));
    renderWithProviders(<LovedNotHere size="M" info="x" />);

    expect(screen.getByText("Add your Last.fm username to see these.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Settings/ })).toHaveAttribute("href", "/settings/listening#lastfm.feeds");
  });

  it("requests a loved track the library is missing", () => {
    mocks.loved.mockReturnValue(ready({ status: "ready", tracks: [catalogTrack("c9")] }));
    renderWithProviders(<LovedNotHere size="M" info="x" />);

    fireEvent.click(screen.getByRole("button", { name: "Request" }));

    expect(mocks.openForResult).toHaveBeenCalledWith(expect.objectContaining({ id: "c9" }));
  });

  it("says when everything loved is already here", () => {
    mocks.loved.mockReturnValue(ready({ status: "ready", tracks: [] }));
    renderWithProviders(<LovedNotHere size="M" info="x" />);

    expect(screen.getByText("Everything you loved is already here.")).toBeInTheDocument();
  });
});

describe("a catalog widget that fails to load", () => {
  const failed = { data: undefined, isLoading: false, isError: true };

  it.each([
    ["Charts", () => <Charts size="L" info="x" />],
    ["Loved on Last.fm, not here", () => <LovedNotHere size="M" info="x" />],
  ])("%s says it could not load, without blaming the listening history", (_name, widget) => {
    mocks.charts.mockReturnValue(failed);
    mocks.loved.mockReturnValue(failed);
    renderWithProviders(widget());

    expect(screen.getByText("Couldn't load this right now.")).toBeInTheDocument();
    expect(screen.queryByText("Couldn't load your listening history.")).not.toBeInTheDocument();
  });
});

describe("Rarities", () => {
  it("shows the index with its threshold and plays a rare track", () => {
    mocks.rarities.mockReturnValue(
      ready({
        index: 75,
        medianListens: 4200,
        threshold: 10_000,
        items: [{ trackId: "t1", title: "Rare", artist: "B", cover: null, plays: 3, listens: 120 }],
      })
    );
    renderWithProviders(<Rarities size="M" info="x" />);

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("of your top tracks have under 10K listens")).toBeInTheDocument();
    expect(screen.getByText("ListenBrainz listens · median 4.2K")).toBeInTheDocument();
    const row = screen.getByRole("listitem");
    expect(row).toHaveTextContent("B · 3 plays by you");
    fireEvent.click(within(row).getByRole("button", { name: "Play Rare" }));
    expect(mocks.playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["t1"] });
  });

  it("explains a library without identified plays", () => {
    mocks.rarities.mockReturnValue(ready({ index: null, medianListens: null, threshold: 10_000, items: [] }));
    renderWithProviders(<Rarities size="M" info="x" />);

    expect(screen.getByText("Not enough identified plays yet.")).toBeInTheDocument();
  });
});

describe("ContinueListening", () => {
  const point = {
    track: {
      id: "t1",
      title: "Si Te Vas",
      artist: "Mägo de Oz",
      durationSeconds: 358,
      artworkUrl: null,
    },
    index: 0,
    total: 5,
    positionSeconds: 5,
    playing: false,
  };

  it("shows where the queue stopped and resumes it", () => {
    const toggle = vi.fn();
    mocks.resume.mockReturnValue({ point, toggle });
    mocks.recentPlays.mockReturnValue(ready([]));
    renderWithProviders(<ContinueListening size="M" info="x" />);

    expect(screen.getByText("Mägo de Oz · 1 of 5")).toBeInTheDocument();
    expect(screen.getByText("0:05 / 5:58")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(mocks.recentPlays).toHaveBeenCalledWith(false);
  });

  it("offers pause while playing and lists recent plays at L", () => {
    mocks.resume.mockReturnValue({ point: { ...point, playing: true }, toggle: vi.fn() });
    mocks.recentPlays.mockReturnValue(
      ready([
        {
          trackId: "t2",
          title: "Black",
          artist: "Pearl Jam",
          cover: null,
          client: "Symfonium",
          playedAt: new Date(),
        },
      ])
    );
    renderWithProviders(<ContinueListening size="L" info="x" />);

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(mocks.recentPlays).toHaveBeenCalledWith(true);
    expect(screen.getByRole("listitem")).toHaveTextContent("Symfonium");
  });

  it("says nothing is waiting when the queue is empty", () => {
    mocks.resume.mockReturnValue({ point: null, toggle: vi.fn() });
    mocks.recentPlays.mockReturnValue(ready([]));
    renderWithProviders(<ContinueListening size="M" info="x" />);

    expect(screen.getByText("Nothing waiting. Play something and it stays here.")).toBeInTheDocument();
  });
});
