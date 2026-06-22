import { afterEach, describe, expect, it, vi } from "vitest";

import enDiscover from "@modules/i18n/messages/en/discover.json";
import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { ArtistSpotlight } from "../ArtistSpotlight";
import type { ArtistSpotlightCardProps } from "../types";

interface SpotlightArtist {
  artist: ArtistSpotlightCardProps["artist"];
  latestAlbum: ArtistSpotlightCardProps["latestAlbum"];
}

interface SpotlightQuery {
  data: { data: { artists: SpotlightArtist[] } } | undefined;
  isLoading: boolean;
  isError: boolean;
}

const useArtistSpotlightMock = vi.fn<() => SpotlightQuery>();
const openForResult = vi.fn();

vi.mock("@hooks/api/queries/useArtistSpotlight", () => ({
  useArtistSpotlight: () => useArtistSpotlightMock(),
}));

vi.mock("@modules/providers/CountryProvider", () => ({
  useCountry: () => ({ country: "US" }),
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult, openForTarget: vi.fn() }),
}));

vi.mock("../ArtistSpotlightCard", () => ({
  ArtistSpotlightCard: ({ artist, onClick }: ArtistSpotlightCardProps) => (
    <button type="button" data-testid="artist-card" data-id={artist.id} onClick={onClick}>
      {artist.name}
    </button>
  ),
}));

function buildArtist(id: string, name: string): SpotlightArtist {
  return {
    artist: { id, name, images: [] },
    latestAlbum: null,
  };
}

function buildQuery(overrides: Partial<SpotlightQuery> = {}): SpotlightQuery {
  return {
    data: { data: { artists: [buildArtist("artist-1", "Aphex Twin")] } },
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

describe("ArtistSpotlight", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useArtistSpotlightMock.mockReset();
  });

  it("always renders the widget header", () => {
    useArtistSpotlightMock.mockReturnValue(buildQuery());

    renderWithProviders(<ArtistSpotlight />);

    expect(screen.getByRole("heading", { name: enDiscover.artistSpotlight.title })).toBeInTheDocument();
  });

  it("renders the loading skeleton while the query is pending", () => {
    useArtistSpotlightMock.mockReturnValue(buildQuery({ isLoading: true, data: undefined }));

    const { container } = renderWithProviders(<ArtistSpotlight />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByTestId("artist-card")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useArtistSpotlightMock.mockReturnValue(buildQuery({ isError: true, data: undefined }));

    renderWithProviders(<ArtistSpotlight />);

    expect(screen.getByText(enDiscover.artistSpotlight.errorTitle)).toBeInTheDocument();
    expect(screen.getByText(enDiscover.artistSpotlight.errorDescription)).toBeInTheDocument();
  });

  it("renders the empty state when the resolved artist list is empty", () => {
    useArtistSpotlightMock.mockReturnValue(buildQuery({ data: { data: { artists: [] } } }));

    renderWithProviders(<ArtistSpotlight />);

    expect(screen.getByText(enDiscover.artistSpotlight.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(enDiscover.artistSpotlight.emptyDescription)).toBeInTheDocument();
  });

  it("renders the empty state when the query data is absent and not loading or erroring", () => {
    useArtistSpotlightMock.mockReturnValue(buildQuery({ data: undefined }));

    renderWithProviders(<ArtistSpotlight />);

    expect(screen.getByText(enDiscover.artistSpotlight.emptyTitle)).toBeInTheDocument();
  });

  it("renders a card per artist when the list resolves", () => {
    useArtistSpotlightMock.mockReturnValue(
      buildQuery({
        data: { data: { artists: [buildArtist("a", "Boards of Canada"), buildArtist("b", "Autechre")] } },
      })
    );

    renderWithProviders(<ArtistSpotlight />);

    const cards = screen.getAllByTestId("artist-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute("data-id", "a");
  });

  it("opens the request flow for the clicked artist", () => {
    useArtistSpotlightMock.mockReturnValue(
      buildQuery({ data: { data: { artists: [buildArtist("a", "Squarepusher")] } } })
    );

    renderWithProviders(<ArtistSpotlight />);
    fireEvent.click(screen.getByTestId("artist-card"));

    expect(openForResult).toHaveBeenCalledTimes(1);
    expect(openForResult.mock.calls[0][0]).toMatchObject({ id: "a", name: "Squarepusher" });
  });
});
