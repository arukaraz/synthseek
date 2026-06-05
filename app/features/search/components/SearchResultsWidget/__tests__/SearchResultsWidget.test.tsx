import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import { createMockTrackFull, createMockAlbumSimplified } from "@test/factories";

import { SearchResultsWidget } from "../SearchResultsWidget";

const searchState = vi.hoisted(() => ({
  data: undefined as { results?: unknown } | undefined,
  isLoading: false,
}));

const params = vi.hoisted(() => new URLSearchParams());
const replaceMock = vi.hoisted(() => vi.fn());
const openForResultMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => params,
}));

vi.mock("@hooks/api/queries/useSearchContent", () => ({
  useSearchContent: () => searchState,
}));

vi.mock("../../ContentRequestFlow/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult: openForResultMock }),
}));

function setParam(key: string, value: string) {
  params.set(key, value);
}

function resultsWithTracksAndAlbums() {
  return {
    results: {
      tracks: { items: [createMockTrackFull({ id: "t1", name: "Track One", title: "Track One" })], total: 1 },
      albums: { items: [createMockAlbumSimplified({ id: "al1", name: "Album One" })], total: 1 },
    },
  };
}

describe("SearchResultsWidget", () => {
  beforeEach(() => {
    params.forEach((_, key) => params.delete(key));
    searchState.data = undefined;
    searchState.isLoading = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the start empty state when there is no query", () => {
    renderWithProviders(<SearchResultsWidget />);

    expect(screen.getByText("Start Searching")).toBeInTheDocument();
  });

  it("shows a loading skeleton while the search is pending", () => {
    setParam("q", "daft");
    searchState.isLoading = true;

    const { container } = renderWithProviders(<SearchResultsWidget />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("shows the no-results empty state when the query returns nothing", () => {
    setParam("q", "daft");
    searchState.data = { results: { tracks: { items: [], total: 0 } } };

    renderWithProviders(<SearchResultsWidget />);

    expect(screen.getByText("No Results Found")).toBeInTheDocument();
  });

  it("renders the heading, count and filter tabs when there are results across types", () => {
    setParam("q", "daft");
    searchState.data = resultsWithTracksAndAlbums();

    const { container } = renderWithProviders(<SearchResultsWidget />);

    expect(screen.getByText("Search Results")).toBeInTheDocument();
    expect(container.querySelector("[data-cy='filter-tab-track']")).not.toBeNull();
  });

  it("renders filtered results when a non-all filter is active", () => {
    setParam("q", "daft");
    setParam("filter", "track");
    searchState.data = resultsWithTracksAndAlbums();

    const { container } = renderWithProviders(<SearchResultsWidget />);

    expect(screen.getByText("Search Results")).toBeInTheDocument();
    expect(container.querySelector("[data-cy='search-result-card-track']")).not.toBeNull();
  });

  it("opens the request flow when a result card is clicked", async () => {
    setParam("q", "daft");
    searchState.data = resultsWithTracksAndAlbums();

    const { user, container } = renderWithProviders(<SearchResultsWidget />);

    const card = container.querySelector<HTMLElement>("[data-cy='search-result-card-track']");
    expect(card).not.toBeNull();
    if (card) await user.click(card);

    expect(openForResultMock).toHaveBeenCalledTimes(1);
    expect(openForResultMock.mock.calls[0][0].id).toBe("t1");
  });

  it("replaces the route with the chosen filter when a filter tab is clicked", async () => {
    setParam("q", "daft");
    searchState.data = resultsWithTracksAndAlbums();

    const { user, container } = renderWithProviders(<SearchResultsWidget />);

    const albumTab = container.querySelector<HTMLElement>("[data-cy='filter-tab-album']");
    expect(albumTab).not.toBeNull();
    if (albumTab) await user.click(albumTab);

    expect(replaceMock).toHaveBeenCalledWith("/search?q=daft&filter=album", { scroll: false });
  });

  it("removes the filter param when switching back to the all tab", async () => {
    setParam("q", "daft");
    setParam("filter", "album");
    searchState.data = resultsWithTracksAndAlbums();

    const { user, container } = renderWithProviders(<SearchResultsWidget />);

    const allTab = container.querySelector<HTMLElement>("[data-cy='filter-tab-all']");
    expect(allTab).not.toBeNull();
    if (allTab) await user.click(allTab);

    expect(replaceMock).toHaveBeenCalledWith("/search?q=daft", { scroll: false });
  });
});
