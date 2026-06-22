import { afterEach, describe, expect, it, vi } from "vitest";

import type { LfmConfig } from "@features/discovery-integrations/types";
import { renderWithProviders, screen } from "@test/test-utils";

import { RecentScrobbles } from "../RecentScrobbles";
import { createScrobble } from "./fixtures";

interface FeedsResult {
  lfmConfig: LfmConfig | undefined;
  recentScrobbles: { status: string; scrobbles: ReturnType<typeof createScrobble>[] } | null;
  isLoading: boolean;
  isError: boolean;
}

const useLastfmFeedsMock = vi.fn<() => FeedsResult>();

vi.mock("@hooks/api/queries/discovery/useLastfmFeeds", () => ({
  useLastfmFeeds: () => useLastfmFeedsMock(),
}));

vi.mock("../RecentScrobblesRail", () => ({
  RecentScrobblesRail: ({ scrobbles }: { scrobbles: ReturnType<typeof createScrobble>[] }) => (
    <div data-testid="rail" data-count={scrobbles.length} />
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
    recentScrobbles: { status: "ready", scrobbles: [createScrobble()] },
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

describe("RecentScrobbles", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useLastfmFeedsMock.mockReset();
  });

  it("renders the skeleton while loading", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ isLoading: true }));

    const { container } = renderWithProviders(<RecentScrobbles />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByTestId("rail")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ isError: true }));

    renderWithProviders(<RecentScrobbles />);

    expect(screen.getByText("Couldn't load Last.fm data.")).toBeInTheDocument();
  });

  it("renders the disabled empty state when Last.fm is off", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ lfmConfig: buildConfig({ enabled: false }) }));

    renderWithProviders(<RecentScrobbles />);

    expect(screen.getByText("Enable Last.fm to see your recent scrobbles here.")).toBeInTheDocument();
  });

  it("renders the disabled empty state when the config is missing", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ lfmConfig: undefined }));

    renderWithProviders(<RecentScrobbles />);

    expect(screen.getByText("Enable Last.fm to see your recent scrobbles here.")).toBeInTheDocument();
  });

  it("renders the no-username empty state when the username is empty", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ lfmConfig: buildConfig({ username: "" }) }));

    renderWithProviders(<RecentScrobbles />);

    expect(screen.getByText("Add your Last.fm username to start syncing scrobbles.")).toBeInTheDocument();
  });

  it("renders the no-data empty state when the feed is not ready", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ recentScrobbles: { status: "empty", scrobbles: [] } }));

    renderWithProviders(<RecentScrobbles />);

    expect(screen.getByText("No scrobbles yet, your timeline will appear here.")).toBeInTheDocument();
  });

  it("renders the no-data empty state when the feed is absent", () => {
    useLastfmFeedsMock.mockReturnValue(buildResult({ recentScrobbles: null }));

    renderWithProviders(<RecentScrobbles />);

    expect(screen.getByText("No scrobbles yet, your timeline will appear here.")).toBeInTheDocument();
  });

  it("renders the no-data empty state when every scrobble lacks a playedAt", () => {
    useLastfmFeedsMock.mockReturnValue(
      buildResult({ recentScrobbles: { status: "ready", scrobbles: [createScrobble({ playedAt: null })] } })
    );

    renderWithProviders(<RecentScrobbles />);

    expect(screen.getByText("No scrobbles yet, your timeline will appear here.")).toBeInTheDocument();
  });

  it("renders the rail with played scrobbles and a See more link to the profile", () => {
    useLastfmFeedsMock.mockReturnValue(
      buildResult({
        lfmConfig: buildConfig({ username: "aphex twin" }),
        recentScrobbles: {
          status: "ready",
          scrobbles: [createScrobble({ catalogTrackId: "a" }), createScrobble({ catalogTrackId: "b", playedAt: null })],
        },
      })
    );

    renderWithProviders(<RecentScrobbles />);

    expect(screen.getByTestId("rail")).toHaveAttribute("data-count", "1");
    expect(screen.getByText("Recent Scrobbles")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Last.fm profile" })).toHaveAttribute(
      "href",
      "https://www.last.fm/user/aphex%20twin"
    );
  });
});
