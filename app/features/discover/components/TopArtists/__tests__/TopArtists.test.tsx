import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { TopArtists } from "../TopArtists";

interface Artist {
  name: string;
  playcount: number;
  catalogArtistId: string | null;
  image: string | null;
}

const mocks = vi.hoisted(() => ({
  topArtists: vi.fn(),
  openForResult: vi.fn(),
}));

vi.mock("@hooks/api/queries/analytics/useProviderTopArtists", () => ({
  useProviderTopArtists: (provider: string) => mocks.topArtists(provider),
}));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult: mocks.openForResult }),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

function ready<T>(data: T) {
  return { data, isLoading: false, isError: false };
}

function artist(name: string, overrides: Partial<Artist> = {}): Artist {
  return { name, playcount: 1200, catalogArtistId: `id-${name}`, image: null, ...overrides };
}

function readyWith(artists: Artist[]) {
  return ready({ status: "ready", username: "listener", artists });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("TopArtists", () => {
  it("ranks the member's Last.fm artists with their plays", () => {
    mocks.topArtists.mockReturnValue(readyWith([artist("Tycho"), artist("Bonobo", { playcount: 1 })]));
    renderWithProviders(<TopArtists size="M" info="x" />);

    expect(mocks.topArtists).toHaveBeenCalledWith("lastfm");
    expect(screen.getByRole("heading", { name: "Top Artists" })).toBeInTheDocument();
    expect(screen.getByText("Most played · all time · Last.fm")).toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("1");
    expect(rows[0]).toHaveTextContent("Tycho");
    expect(rows[0]).toHaveTextContent("1,200 plays");
    expect(rows[1]).toHaveTextContent("2");
    expect(rows[1]).toHaveTextContent("1 play");
    expect(rows[1]).not.toHaveTextContent("1 plays");
  });

  it("reads ListenBrainz and names it when the tile is the ListenBrainz one", () => {
    mocks.topArtists.mockReturnValue(readyWith([artist("Tycho")]));
    renderWithProviders(<TopArtists size="M" info="x" provider="listenbrainz" />);

    expect(mocks.topArtists).toHaveBeenCalledWith("listenbrainz");
    expect(screen.getByText("Most played · all time · ListenBrainz")).toBeInTheDocument();
  });

  it("opens the artist the catalog matched, and offers nothing to open for one it did not", () => {
    mocks.topArtists.mockReturnValue(
      readyWith([artist("Tycho", { image: "tycho.jpg" }), artist("Unknown", { catalogArtistId: null })])
    );
    renderWithProviders(<TopArtists size="M" info="x" />);

    fireEvent.click(screen.getByRole("button", { name: /Tycho/ }));

    expect(mocks.openForResult).toHaveBeenCalledTimes(1);
    expect(mocks.openForResult).toHaveBeenCalledWith(expect.objectContaining({ id: "id-Tycho", name: "Tycho" }));
    expect(screen.queryByRole("button", { name: /Unknown/ })).not.toBeInTheDocument();
  });

  it("keeps a quarter tile to four artists", () => {
    mocks.topArtists.mockReturnValue(readyWith(["a", "b", "c", "d", "e", "f"].map((name) => artist(name))));
    renderWithProviders(<TopArtists size="S" info="x" />);

    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("says the provider is not set up on this server, with no link to the member's settings", () => {
    mocks.topArtists.mockReturnValue(ready({ status: "inactive" }));
    renderWithProviders(<TopArtists size="M" info="x" />);

    expect(screen.getByText("Last.fm is not set up on this server.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Settings/ })).not.toBeInTheDocument();
  });

  it("asks for the username and points to that provider's settings when the member is not linked", () => {
    mocks.topArtists.mockReturnValue(ready({ status: "unlinked" }));
    renderWithProviders(<TopArtists size="M" info="x" provider="listenbrainz" />);

    expect(screen.getByText("Add your ListenBrainz username to see these.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Settings/ })).toHaveAttribute(
      "href",
      "/settings/connections/services#listenbrainz.feeds"
    );
  });

  it("says when there is nothing ranked yet, and when it could not load", () => {
    mocks.topArtists.mockReturnValue(readyWith([]));
    const { unmount } = renderWithProviders(<TopArtists size="M" info="x" />);
    expect(screen.getByText("No top artists yet, play some music to see them ranked.")).toBeInTheDocument();
    unmount();

    mocks.topArtists.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<TopArtists size="M" info="x" />);
    expect(screen.getByText("Couldn't load this right now.")).toBeInTheDocument();
  });
});
