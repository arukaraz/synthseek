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
  data: SpotlightArtist[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

const useArtistsForYouMock = vi.fn<(countryName: string) => SpotlightQuery>();
const openForResult = vi.fn();

vi.mock("@hooks/api/queries/analytics/useArtistsForYou", () => ({
  useArtistsForYou: (countryName: string) => useArtistsForYouMock(countryName),
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
    data: [buildArtist("artist-1", "Aphex Twin")],
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

describe("ArtistSpotlight", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useArtistsForYouMock.mockReset();
  });

  it("always renders the widget header", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery());

    renderWithProviders(<ArtistSpotlight info="Artists to explore next" />);

    expect(screen.getByRole("heading", { name: enDiscover.artistSpotlight.title })).toBeInTheDocument();
    expect(useArtistsForYouMock).toHaveBeenCalledWith("United States");
  });

  it("renders the loading skeleton while the query is pending", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ isLoading: true, data: undefined }));

    const { container } = renderWithProviders(<ArtistSpotlight info="Artists to explore next" />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByTestId("artist-card")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ isError: true, data: undefined }));

    renderWithProviders(<ArtistSpotlight info="Artists to explore next" />);

    expect(screen.getByText(enDiscover.artistSpotlight.errorTitle)).toBeInTheDocument();
    expect(screen.getByText(enDiscover.artistSpotlight.errorDescription)).toBeInTheDocument();
  });

  it("renders the empty state when the resolved artist list is empty", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ data: [] }));

    renderWithProviders(<ArtistSpotlight info="Artists to explore next" />);

    expect(screen.getByText(enDiscover.artistSpotlight.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(enDiscover.artistSpotlight.emptyDescription)).toBeInTheDocument();
  });

  it("renders the empty state when the query data is absent and not loading or erroring", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ data: undefined }));

    renderWithProviders(<ArtistSpotlight info="Artists to explore next" />);

    expect(screen.getByText(enDiscover.artistSpotlight.emptyTitle)).toBeInTheDocument();
  });

  it("renders a card per artist when the list resolves", () => {
    useArtistsForYouMock.mockReturnValue(
      buildQuery({ data: [buildArtist("a", "Boards of Canada"), buildArtist("b", "Autechre")] })
    );

    renderWithProviders(<ArtistSpotlight info="Artists to explore next" />);

    const cards = screen.getAllByTestId("artist-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute("data-id", "a");
  });

  it("opens the request flow for the clicked artist", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ data: [buildArtist("a", "Squarepusher")] }));

    renderWithProviders(<ArtistSpotlight info="Artists to explore next" />);
    fireEvent.click(screen.getByTestId("artist-card"));

    expect(openForResult).toHaveBeenCalledTimes(1);
    expect(openForResult.mock.calls[0][0]).toMatchObject({ id: "a", name: "Squarepusher" });
  });
});
