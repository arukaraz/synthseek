import { afterEach, describe, expect, it, vi } from "vitest";

import type { ListenedTrack, ListeningProvider } from "@hooks/api/queries/analytics/types";
import { renderWithProviders, screen } from "@test/test-utils";

import { TopTracks } from "../TopTracks";
import type { TopTrackHeroProps, TopTracksListProps } from "../types";
import { createTopTrack } from "./fixtures";

type ListenedTracks =
  | { status: "inactive" }
  | { status: "unlinked" }
  | { status: "ready"; username: string; topTracks: ListenedTrack[]; recentTracks: ListenedTrack[] };

interface ListenedQuery {
  data: ListenedTracks | undefined;
  isLoading: boolean;
  isError: boolean;
}

const useListenedTracksMock = vi.fn<(provider: ListeningProvider) => ListenedQuery>();

vi.mock("@hooks/api/queries/analytics/useListenedTracks", () => ({
  useListenedTracks: (provider: ListeningProvider) => useListenedTracksMock(provider),
}));

vi.mock("../TopTrackHero", () => ({
  TopTrackHero: ({ track }: TopTrackHeroProps) => <div data-testid="hero" data-id={track.id} />,
}));

vi.mock("../TopTrackLeader", () => ({
  TopTrackLeader: ({ track }: TopTrackHeroProps) => <div data-testid="leader" data-id={track.id} />,
}));

vi.mock("../TopTracksList", () => ({
  TopTracksList: ({ tracks, startRank, columns }: TopTracksListProps) => (
    <div data-testid="list" data-count={tracks.length} data-start={startRank} data-columns={columns} />
  ),
}));

function answered(data: ListenedTracks): ListenedQuery {
  return { data, isLoading: false, isError: false };
}

function ready(topTracks: ListenedTrack[] = [createTopTrack()]): ListenedQuery {
  return answered({ status: "ready", username: "aphex", topTracks, recentTracks: [] });
}

function twelve(): ListenedTrack[] {
  return Array.from({ length: 12 }, (_, i) => createTopTrack({ id: `t-${i}` }));
}

describe("TopTracks", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useListenedTracksMock.mockReset();
  });

  it("renders the skeleton while loading", () => {
    useListenedTracksMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    const { container } = renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByTestId("hero")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useListenedTracksMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    expect(screen.getByText("Couldn't load Last.fm data.")).toBeInTheDocument();
  });

  it("says the server has no Last.fm set up, with nothing to configure, when the provider is inactive", () => {
    useListenedTracksMock.mockReturnValue(answered({ status: "inactive" }));

    renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    expect(screen.getByText("Last.fm is not set up on this server.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("No top tracks yet, play some music to see them ranked.")).not.toBeInTheDocument();
  });

  it("asks for the username, with a link to configure it, when the member has not linked the provider", () => {
    useListenedTracksMock.mockReturnValue(answered({ status: "unlinked" }));

    renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    expect(screen.getByText("Add your Last.fm username to see your top tracks here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configure Last.fm" })).toBeInTheDocument();
  });

  it("renders the no-data empty state when the provider has no top tracks", () => {
    useListenedTracksMock.mockReturnValue(ready([]));

    renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    expect(screen.getByText("No top tracks yet, play some music to see them ranked.")).toBeInTheDocument();
  });

  it("reads Last.fm unless the tile names another provider", () => {
    useListenedTracksMock.mockReturnValue(ready());

    renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    expect(useListenedTracksMock).toHaveBeenCalledWith("lastfm");
    expect(screen.getByText("Most played · all time · Last.fm")).toBeInTheDocument();
  });

  it("reads ListenBrainz and names it when the tile is the ListenBrainz one", () => {
    useListenedTracksMock.mockReturnValue(ready());

    renderWithProviders(<TopTracks size="M" info="Your top tracks" provider="listenbrainz" />);

    expect(useListenedTracksMock).toHaveBeenCalledWith("listenbrainz");
    expect(screen.getByText("Most played · all time · ListenBrainz")).toBeInTheDocument();
  });

  it("renders the hero from the top track and the list from the remainder starting at rank two", () => {
    useListenedTracksMock.mockReturnValue(
      ready([createTopTrack({ id: "hero" }), createTopTrack({ id: "r1" }), createTopTrack({ id: "r2" })])
    );

    renderWithProviders(<TopTracks size="L" info="Your top tracks" />);

    expect(screen.getByTestId("hero")).toHaveAttribute("data-id", "hero");
    expect(screen.queryByTestId("leader")).not.toBeInTheDocument();
    expect(screen.getByTestId("list")).toHaveAttribute("data-count", "2");
    expect(screen.getByTestId("list")).toHaveAttribute("data-start", "2");
    expect(screen.getByRole("heading", { name: "Top Tracks" })).toBeInTheDocument();
  });

  it("shows the top track as a leader, the way Charts does, in a half-row tile", () => {
    useListenedTracksMock.mockReturnValue(ready([createTopTrack({ id: "hero" }), createTopTrack({ id: "r1" })]));

    renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    expect(screen.getByTestId("leader")).toHaveAttribute("data-id", "hero");
    expect(screen.queryByTestId("hero")).not.toBeInTheDocument();
    expect(screen.getByTestId("list")).toHaveAttribute("data-start", "2");
  });

  it("caps the list at eight rows past the hero", () => {
    useListenedTracksMock.mockReturnValue(ready(twelve()));

    renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    expect(screen.getByTestId("list")).toHaveAttribute("data-count", "8");
    expect(screen.getByTestId("list")).toHaveAttribute("data-columns", "one");
  });

  it("drops the hero in a quarter tile and lists the top four from rank one", () => {
    useListenedTracksMock.mockReturnValue(ready(twelve()));

    renderWithProviders(<TopTracks size="S" info="Your top tracks" />);

    expect(screen.queryByTestId("hero")).not.toBeInTheDocument();
    expect(screen.getByTestId("list")).toHaveAttribute("data-count", "4");
    expect(screen.getByTestId("list")).toHaveAttribute("data-start", "1");
  });

  it("keeps the hero across a full row and splits the eight rows in two columns", () => {
    useListenedTracksMock.mockReturnValue(ready(twelve()));

    renderWithProviders(<TopTracks size="L" info="Your top tracks" />);

    expect(screen.getByTestId("hero")).toHaveAttribute("data-id", "t-0");
    expect(screen.getByTestId("list")).toHaveAttribute("data-count", "8");
    expect(screen.getByTestId("list")).toHaveAttribute("data-start", "2");
    expect(screen.getByTestId("list")).toHaveAttribute("data-columns", "two");
  });
});
