import { afterEach, describe, expect, it, vi } from "vitest";

import type { LastfmTopTracksFeed, LfmConfig } from "@features/discovery-integrations/types";
import enDiscover from "@modules/i18n/messages/en/discover.json";
import { renderWithProviders, screen } from "@test/test-utils";

import { TopTracks } from "../TopTracks";
import type { TopTrackHeroProps, TopTracksListProps } from "../types";
import { createTopTrack } from "./fixtures";

interface FeedsResult {
  lfmConfig: LfmConfig | undefined;
  topTracks: LastfmTopTracksFeed | null;
  isLoading: boolean;
  isError: boolean;
}

const useLastfmFeedsMock = vi.fn<() => FeedsResult>();

vi.mock("@hooks/api/queries/discovery/useLastfmFeeds", () => ({
  useLastfmFeeds: () => useLastfmFeedsMock(),
}));

vi.mock("../TopTrackHero", () => ({
  TopTrackHero: ({ track }: TopTrackHeroProps) => <div data-testid="hero" data-id={track.catalogTrackId} />,
}));

vi.mock("../TopTracksList", () => ({
  TopTracksList: ({ tracks, startRank }: TopTracksListProps) => (
    <div data-testid="list" data-count={tracks.length} data-start={startRank} />
  ),
}));

function buildConfig(overrides: Partial<LfmConfig> = {}): LfmConfig {
  return {
    enabled: true,
    username: "aphex",
    ...overrides,
  } as LfmConfig;
}

function buildResult(overrides: Partial<FeedsResult> = {}): FeedsResult {
  return {
    lfmConfig: buildConfig(),
    topTracks: { status: "ready", tracks: [createTopTrack()], generatedAt: "2026-05-29T07:00:00.000Z" },
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

describe("TopTracks", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useLastfmFeedsMock.mockReset();
  });

  it("renders the skeleton while loading", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ isLoading: true }));

    const { container } = renderWithProviders(<TopTracks />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByTestId("hero")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ isError: true }));

    renderWithProviders(<TopTracks />);

    expect(screen.getByText(enDiscover.topTracks.empty.error)).toBeInTheDocument();
  });

  it("renders the disabled empty state when Last.fm is off", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ lfmConfig: buildConfig({ enabled: false }) }));

    renderWithProviders(<TopTracks />);

    expect(screen.getByText(enDiscover.topTracks.empty.disabled)).toBeInTheDocument();
  });

  it("renders the disabled empty state when the config is missing", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ lfmConfig: undefined }));

    renderWithProviders(<TopTracks />);

    expect(screen.getByText(enDiscover.topTracks.empty.disabled)).toBeInTheDocument();
  });

  it("renders the no-username empty state when the username is empty", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ lfmConfig: buildConfig({ username: "" }) }));

    renderWithProviders(<TopTracks />);

    expect(screen.getByText(enDiscover.topTracks.empty.noUsername)).toBeInTheDocument();
  });

  it("renders the no-data empty state when the feed is not ready", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ topTracks: { status: "empty", tracks: [] } }));

    renderWithProviders(<TopTracks />);

    expect(screen.getByText(enDiscover.topTracks.empty.noData)).toBeInTheDocument();
  });

  it("renders the no-data empty state when the feed is absent", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ topTracks: null }));

    renderWithProviders(<TopTracks />);

    expect(screen.getByText(enDiscover.topTracks.empty.noData)).toBeInTheDocument();
  });

  it("renders the no-data empty state when the ready feed has no tracks", () => {
    useLastfmFeedsMock.mockReturnValue(
      buildResult({ topTracks: { status: "ready", tracks: [], generatedAt: "2026-05-29T07:00:00.000Z" } })
    );

    renderWithProviders(<TopTracks />);

    expect(screen.getByText(enDiscover.topTracks.empty.noData)).toBeInTheDocument();
  });

  it("renders the hero from the top track and the list from the remainder starting at rank two", () => {
    useLastfmFeedsMock.mockReturnValue(
      buildResult({
        topTracks: {
          status: "ready",
          generatedAt: "2026-05-29T07:00:00.000Z",
          tracks: [
            createTopTrack({ catalogTrackId: "hero" }),
            createTopTrack({ catalogTrackId: "r1" }),
            createTopTrack({ catalogTrackId: "r2" }),
          ],
        },
      })
    );

    renderWithProviders(<TopTracks />);

    expect(screen.getByTestId("hero")).toHaveAttribute("data-id", "hero");
    expect(screen.getByTestId("list")).toHaveAttribute("data-count", "2");
    expect(screen.getByTestId("list")).toHaveAttribute("data-start", "2");
    expect(screen.getByRole("heading", { name: enDiscover.topTracks.title })).toBeInTheDocument();
  });

  it("caps the list at the configured limit of five rows past the hero", () => {
    const tracks = Array.from({ length: 9 }, (_, i) => createTopTrack({ catalogTrackId: `t-${i}` }));
    useLastfmFeedsMock.mockReturnValue(
      buildResult({ topTracks: { status: "ready", tracks, generatedAt: "2026-05-29T07:00:00.000Z" } })
    );

    renderWithProviders(<TopTracks />);

    expect(screen.getByTestId("list")).toHaveAttribute("data-count", "5");
  });
});
