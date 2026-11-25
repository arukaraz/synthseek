import { afterEach, describe, expect, it, vi } from "vitest";

import type { ListenedTrack, ListenedTracks, ListeningProvider } from "@hooks/api/queries/analytics/types";
import { renderWithProviders, screen, within } from "@test/test-utils";

import { TopTracks } from "../TopTracks";
import { createTopTrack } from "./fixtures";

interface ListenedQuery {
  data: ListenedTracks | undefined;
  isLoading: boolean;
  isError: boolean;
}

const useListenedTracksMock = vi.fn<(provider: ListeningProvider) => ListenedQuery>();

vi.mock("@hooks/api/queries/analytics/useListenedTracks", () => ({
  useListenedTracks: (provider: ListeningProvider) => useListenedTracksMock(provider),
}));
vi.mock("@hooks/ui/useEntityPlayback", () => ({
  useEntityPlayback: () => ({ playEntity: vi.fn(), shuffleEntity: vi.fn(), startRadio: vi.fn() }),
}));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget: vi.fn(), requestResult: vi.fn() }),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

function answered(data: ListenedTracks): ListenedQuery {
  return { data, isLoading: false, isError: false };
}

function ready(topTracks: ListenedTrack[] = [createTopTrack()]): ListenedQuery {
  return answered({ status: "ready", username: "aphex", topTracks, recentTracks: [] });
}

function twelve(): ListenedTrack[] {
  return Array.from({ length: 12 }, (_, i) => createTopTrack({ id: `t-${i}`, title: `Track ${i}` }));
}

describe("TopTracks", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useListenedTracksMock.mockReset();
  });

  it("shows no leader while loading", () => {
    useListenedTracksMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByText("No top tracks yet, play some music to see them ranked.")).not.toBeInTheDocument();
  });

  it("says it could not load when the query errors", () => {
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
    expect(screen.getByRole("link", { name: "Configure Last.fm" })).toHaveAttribute(
      "href",
      "/settings/connections/services#lastfm.feeds"
    );
  });

  it("says there is nothing ranked yet when the provider has no top tracks", () => {
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

  it("leads with the top track under its badge, with no rank number, and ranks the rest from two", () => {
    useListenedTracksMock.mockReturnValue(
      ready([
        createTopTrack({ id: "lead", title: "Windowlicker", playcount: 4200 }),
        createTopTrack({ id: "r1", title: "Xtal", playcount: 12 }),
      ])
    );

    renderWithProviders(<TopTracks size="M" info="Your top tracks" />);

    const leader = screen.getByRole("article");
    expect(leader).toHaveTextContent("#1 most played");
    expect(leader).toHaveTextContent("Windowlicker");
    expect(leader).toHaveTextContent("4.2k plays");
    expect(within(leader).queryByText("1")).not.toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("2");
    expect(rows[0]).toHaveTextContent("Xtal");
    expect(rows[0]).toHaveTextContent("12 plays");
    expect(screen.getByRole("heading", { name: "Top Tracks" })).toBeInTheDocument();
  });

  it("draws every size with the Leader look's own limits", () => {
    useListenedTracksMock.mockReturnValue(ready(twelve()));

    const { unmount } = renderWithProviders(<TopTracks size="S" info="Your top tracks" />);
    expect(screen.getByRole("article")).toHaveTextContent("Track 0");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    unmount();

    renderWithProviders(<TopTracks size="L" info="Your top tracks" />);
    expect(screen.getByRole("article")).toHaveTextContent("Track 0");
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
  });
});
