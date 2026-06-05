import { describe, it, expect, vi, afterEach } from "vitest";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@api/__generated__/types";

import { renderWithProviders, screen, within } from "@test/test-utils";
import { createMockQuery, createLoadingQuery, createErrorQuery } from "@test/mocks";

import { LibraryLeaderboard } from "../LibraryLeaderboard";

type LibrarySummary = inferRouterOutputs<AppRouter>["requests"]["getLibrarySummary"];

const useLibrarySummaryMock = vi.fn();

vi.mock("@hooks/api/queries/useLibrarySummary", () => ({
  useLibrarySummary: () => useLibrarySummaryMock(),
}));

function buildSummary(overrides: Partial<LibrarySummary> = {}): LibrarySummary {
  return {
    completedTracks: 1234,
    completedAlbums: 88,
    queuedTracks: 7,
    totalDurationMs: 3 * 60 * 60 * 1000,
    topArtists: [
      { artist: "Aphex Twin", trackCount: 42, image: "https://img/aphex.jpg" },
      { artist: "Boards of Canada", trackCount: 30, image: null },
      { artist: "Autechre", trackCount: 18, image: null },
    ],
    topGenres: [
      { genre: "IDM", albumCount: 25, image: null },
      { genre: "Ambient", albumCount: 12, image: null },
    ],
    ...overrides,
  };
}

describe("LibraryLeaderboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useLibrarySummaryMock.mockReset();
  });

  it("renders the skeleton while loading", () => {
    useLibrarySummaryMock.mockReturnValue(createLoadingQuery<LibrarySummary>());

    const { container } = renderWithProviders(<LibraryLeaderboard />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("renders the error empty state when the query errors", () => {
    useLibrarySummaryMock.mockReturnValue(createErrorQuery<LibrarySummary>(new Error("boom")));

    renderWithProviders(<LibraryLeaderboard />);

    expect(screen.getByText("Failed to load library")).toBeInTheDocument();
  });

  it("renders the error empty state when there is no data", () => {
    useLibrarySummaryMock.mockReturnValue(createMockQuery<LibrarySummary | undefined>(undefined));

    renderWithProviders(<LibraryLeaderboard />);

    expect(screen.getByText("Failed to load library")).toBeInTheDocument();
  });

  it("renders stats, the top artist hero and the rest of the rows", () => {
    useLibrarySummaryMock.mockReturnValue(createMockQuery(buildSummary()));

    renderWithProviders(<LibraryLeaderboard />);

    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("3h")).toBeInTheDocument();
    expect(screen.getByText("Top artists")).toBeInTheDocument();
    expect(screen.getByText("Aphex Twin")).toBeInTheDocument();
    expect(screen.getByText("Boards of Canada")).toBeInTheDocument();
    expect(screen.getByText("Autechre")).toBeInTheDocument();
    expect(screen.getByText("tracks")).toBeInTheDocument();
  });

  it("switches to genres when the genres tab is clicked", async () => {
    useLibrarySummaryMock.mockReturnValue(createMockQuery(buildSummary()));

    const { user } = renderWithProviders(<LibraryLeaderboard />);

    await user.click(screen.getByRole("tab", { name: "Genres" }));

    expect(screen.getByText("Top genres")).toBeInTheDocument();
    expect(screen.getByText("IDM")).toBeInTheDocument();
    expect(screen.getByText("Ambient")).toBeInTheDocument();
    expect(screen.getByText("albums")).toBeInTheDocument();
  });

  it("renders the artists empty state when there are no top artists", () => {
    useLibrarySummaryMock.mockReturnValue(createMockQuery(buildSummary({ topArtists: [] })));

    renderWithProviders(<LibraryLeaderboard />);

    expect(screen.getByText("No artists yet")).toBeInTheDocument();
  });

  it("renders the genres empty state when there are no top genres", async () => {
    useLibrarySummaryMock.mockReturnValue(createMockQuery(buildSummary({ topGenres: [] })));

    const { user } = renderWithProviders(<LibraryLeaderboard />);

    await user.click(screen.getByRole("tab", { name: "Genres" }));

    expect(screen.getByText("No genres yet")).toBeInTheDocument();
  });

  it("marks the active tab with aria-selected", () => {
    useLibrarySummaryMock.mockReturnValue(createMockQuery(buildSummary()));

    renderWithProviders(<LibraryLeaderboard />);

    const tablist = screen.getByRole("tablist", { name: "Library leaderboard mode" });
    const artistsTab = within(tablist).getByRole("tab", { name: "Artists" });
    expect(artistsTab).toHaveAttribute("aria-selected", "true");
  });
});
