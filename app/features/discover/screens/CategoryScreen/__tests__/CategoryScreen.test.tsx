import { describe, it, expect, vi, afterEach } from "vitest";
import { renderWithProviders, screen, fireEvent } from "@test/test-utils";
import { createMockQuery, createLoadingQuery, createErrorQuery } from "@test/mocks/trpc.mock";
import type { MusicItem } from "@api/__generated__/types";
import { CategoryScreen } from "../CategoryScreen";

interface CategoryPayload {
  data: { albums: MusicItem[]; playlists: { items: MusicItem[] } };
}

const useCategoryPlaylistsMock = vi.fn();
const openForResultMock = vi.fn();
const backMock = vi.fn();
const paramsMock = vi.fn(() => ({ categoryId: "rock" }));
const searchParamsGetMock = vi.fn((key: string) => (key === "name" ? "Rock" : null));

vi.mock("next/navigation", () => ({
  useParams: () => paramsMock(),
  useSearchParams: () => ({ get: searchParamsGetMock }),
  useRouter: () => ({ back: backMock, push: vi.fn() }),
}));

vi.mock("@hooks/api/queries/useCategoryPlaylists", () => ({
  useCategoryPlaylists: () => useCategoryPlaylistsMock(),
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult: openForResultMock, openForTarget: vi.fn() }),
}));

vi.mock("@features/search/components/Results/Results", () => ({
  Results: ({
    results,
    onResultClick,
  }: {
    results: MusicItem[];
    onResultClick: (id: string, type: string) => void;
  }) => (
    <div data-testid="results">
      {results.map((r) => (
        <button key={r.id} type="button" onClick={() => onResultClick(r.id, r.type)}>
          {r.name ?? r.id}
        </button>
      ))}
    </div>
  ),
}));

function createAlbum(id: string, name: string): MusicItem {
  return {
    type: "album",
    id,
    name,
    artist: "Artist",
    artists: [],
    images: [],
    release_date: "2026",
    total_tracks: 10,
    genres: [],
    label: null,
    upc: null,
    tracks: [],
  };
}

function createPlaylist(id: string, name: string): MusicItem {
  return {
    type: "playlist",
    id,
    name,
    images: [],
    description: null,
    owner: { id: "owner-1", name: "Owner" },
    total_tracks: 5,
    tracks: [],
  };
}

function buildPayload(albums: MusicItem[], playlists: MusicItem[]): CategoryPayload {
  return { data: { albums, playlists: { items: playlists } } };
}

describe("CategoryScreen", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useCategoryPlaylistsMock.mockReset();
    paramsMock.mockReturnValue({ categoryId: "rock" });
    searchParamsGetMock.mockImplementation((key: string) => (key === "name" ? "Rock" : null));
  });

  it("renders the category name from the search params", () => {
    useCategoryPlaylistsMock.mockReturnValue(createLoadingQuery<CategoryPayload>());

    renderWithProviders(<CategoryScreen />);

    expect(screen.getByRole("heading", { name: "Rock" })).toBeInTheDocument();
  });

  it("falls back to the default name when the search param is missing", () => {
    searchParamsGetMock.mockReturnValue(null);
    useCategoryPlaylistsMock.mockReturnValue(createLoadingQuery<CategoryPayload>());

    renderWithProviders(<CategoryScreen />);

    expect(screen.getByRole("heading", { name: "Category" })).toBeInTheDocument();
  });

  it("renders the loading copy and content skeleton while loading", () => {
    useCategoryPlaylistsMock.mockReturnValue(createLoadingQuery<CategoryPayload>());

    const { container } = renderWithProviders(<CategoryScreen />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useCategoryPlaylistsMock.mockReturnValue(createErrorQuery<CategoryPayload>(new Error("boom")));

    renderWithProviders(<CategoryScreen />);

    expect(screen.getByText("Failed to load content")).toBeInTheDocument();
  });

  it("renders the empty state when there is no content", () => {
    useCategoryPlaylistsMock.mockReturnValue(createMockQuery<CategoryPayload>(buildPayload([], [])));

    renderWithProviders(<CategoryScreen />);

    expect(screen.getByText("No Content")).toBeInTheDocument();
  });

  it("renders the album and playlist sections with counts when content exists", () => {
    useCategoryPlaylistsMock.mockReturnValue(
      createMockQuery<CategoryPayload>(
        buildPayload([createAlbum("al-1", "Album One")], [createPlaylist("pl-1", "Playlist One")])
      )
    );

    renderWithProviders(<CategoryScreen />);

    expect(screen.getByText("1 albums · 1 playlists")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Albums" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Playlists" })).toBeInTheDocument();
    expect(screen.getByText("Album One")).toBeInTheDocument();
    expect(screen.getByText("Playlist One")).toBeInTheDocument();
  });

  it("omits the playlists section when there are only albums", () => {
    useCategoryPlaylistsMock.mockReturnValue(
      createMockQuery<CategoryPayload>(buildPayload([createAlbum("al-1", "Album One")], []))
    );

    renderWithProviders(<CategoryScreen />);

    expect(screen.getByRole("heading", { name: "Albums" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Playlists" })).not.toBeInTheDocument();
  });

  it("opens the request flow when a result is clicked", () => {
    const album = createAlbum("al-1", "Album One");
    useCategoryPlaylistsMock.mockReturnValue(createMockQuery<CategoryPayload>(buildPayload([album], [])));

    renderWithProviders(<CategoryScreen />);
    fireEvent.click(screen.getByText("Album One"));

    expect(openForResultMock).toHaveBeenCalledWith(album);
  });

  it("ignores a result click for an id not in the content set", () => {
    const album = createAlbum("al-1", "Album One");
    useCategoryPlaylistsMock.mockReturnValue(createMockQuery<CategoryPayload>(buildPayload([album], [])));

    renderWithProviders(<CategoryScreen />);
    fireEvent.click(screen.getByText("Album One"));
    openForResultMock.mockClear();

    expect(openForResultMock).not.toHaveBeenCalled();
  });

  it("navigates back when the back button is clicked", () => {
    useCategoryPlaylistsMock.mockReturnValue(createMockQuery<CategoryPayload>(buildPayload([], [])));

    renderWithProviders(<CategoryScreen />);
    fireEvent.click(screen.getByText("Back to Discover"));

    expect(backMock).toHaveBeenCalledTimes(1);
  });
});
