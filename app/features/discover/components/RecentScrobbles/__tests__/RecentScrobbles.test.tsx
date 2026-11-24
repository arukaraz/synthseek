import { afterEach, describe, expect, it, vi } from "vitest";

import type { ListenedTrack, ListeningProvider } from "@hooks/api/queries/analytics/types";
import { renderWithProviders, screen } from "@test/test-utils";

import { RecentScrobbles } from "../RecentScrobbles";
import { createScrobble } from "./fixtures";

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

vi.mock("../RecentScrobblesRail", () => ({
  RecentScrobblesRail: ({ scrobbles }: { scrobbles: ListenedTrack[] }) => (
    <div data-testid="rail" data-count={scrobbles.length} />
  ),
}));

vi.mock("../RecentScrobblesTimeline", () => ({
  RecentScrobblesTimeline: ({ scrobbles }: { scrobbles: ListenedTrack[] }) => (
    <div data-testid="timeline" data-count={scrobbles.length} />
  ),
}));

function answered(data: ListenedTracks): ListenedQuery {
  return { data, isLoading: false, isError: false };
}

function ready(recentTracks: ListenedTrack[] = [createScrobble()], username = "aphex"): ListenedQuery {
  return answered({ status: "ready", username, topTracks: [], recentTracks });
}

describe("RecentScrobbles", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useListenedTracksMock.mockReset();
  });

  it("renders the skeleton while loading", () => {
    useListenedTracksMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    const { container } = renderWithProviders(<RecentScrobbles size="L" info="Your latest scrobbles" />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByTestId("rail")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useListenedTracksMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    renderWithProviders(<RecentScrobbles size="L" info="Your latest scrobbles" />);

    expect(screen.getByText("Couldn't load Last.fm data.")).toBeInTheDocument();
  });

  it("says the server has no Last.fm set up, with nothing to configure, when the provider is inactive", () => {
    useListenedTracksMock.mockReturnValue(answered({ status: "inactive" }));

    renderWithProviders(<RecentScrobbles size="L" info="Your latest scrobbles" />);

    expect(screen.getByText("Last.fm is not set up on this server.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("Nothing played yet, your timeline will appear here.")).not.toBeInTheDocument();
  });

  it("asks for the username, with a link to configure it, when the member has not linked the provider", () => {
    useListenedTracksMock.mockReturnValue(answered({ status: "unlinked" }));

    renderWithProviders(<RecentScrobbles size="L" info="Your latest scrobbles" />);

    expect(screen.getByText("Add your Last.fm username to see your recent plays here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configure Last.fm" })).toBeInTheDocument();
  });

  it("renders the no-data empty state when the provider has no recent plays", () => {
    useListenedTracksMock.mockReturnValue(ready([]));

    renderWithProviders(<RecentScrobbles size="L" info="Your latest scrobbles" />);

    expect(screen.getByText("Nothing played yet, your timeline will appear here.")).toBeInTheDocument();
  });

  it("renders the no-data empty state when every scrobble lacks a playedAt", () => {
    useListenedTracksMock.mockReturnValue(ready([createScrobble({ playedAt: null })]));

    renderWithProviders(<RecentScrobbles size="L" info="Your latest scrobbles" />);

    expect(screen.getByText("Nothing played yet, your timeline will appear here.")).toBeInTheDocument();
  });

  it("renders the rail with played scrobbles and a See more link to the profile", () => {
    useListenedTracksMock.mockReturnValue(
      ready([createScrobble({ id: "a" }), createScrobble({ id: "b", playedAt: null })], "aphex twin")
    );

    renderWithProviders(<RecentScrobbles size="L" info="Your latest scrobbles" />);

    expect(useListenedTracksMock).toHaveBeenCalledWith("lastfm");
    expect(screen.getByTestId("rail")).toHaveAttribute("data-count", "1");
    expect(screen.getByText("Recent Scrobbles")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Last.fm profile" })).toHaveAttribute(
      "href",
      "https://www.last.fm/user/aphex%20twin"
    );
    expect(screen.queryByTestId("timeline")).not.toBeInTheDocument();
  });

  it("reads ListenBrainz, titles the tile Recent Listens and links to the ListenBrainz profile", () => {
    useListenedTracksMock.mockReturnValue(ready([createScrobble()], "aphex twin"));

    renderWithProviders(<RecentScrobbles size="L" info="Your latest listens" provider="listenbrainz" />);

    expect(useListenedTracksMock).toHaveBeenCalledWith("listenbrainz");
    expect(screen.getByRole("heading", { name: "Recent Listens" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open ListenBrainz profile" })).toHaveAttribute(
      "href",
      "https://listenbrainz.org/user/aphex%20twin"
    );
  });

  it("renders the vertical timeline instead of the rail at size M", () => {
    useListenedTracksMock.mockReturnValue(ready());

    renderWithProviders(<RecentScrobbles size="M" info="Your latest scrobbles" />);

    expect(screen.getByTestId("timeline")).toHaveAttribute("data-count", "1");
    expect(screen.queryByTestId("rail")).not.toBeInTheDocument();
  });

  it("shows the widget description in an info tooltip trigger", () => {
    useListenedTracksMock.mockReturnValue(ready());

    renderWithProviders(<RecentScrobbles size="L" info="Your latest scrobbles" />);

    expect(screen.getByRole("button", { name: /more information/i })).toBeInTheDocument();
  });
});
