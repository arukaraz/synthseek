import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import enContentDetail from "@modules/i18n/messages/en/contentDetail.json";

interface DiscographyAlbum {
  externalId: string;
  title: string;
  image: string | null;
  inLibrary: boolean;
  libraryTrackCount: number;
  totalTracks: number;
}

interface SimilarArtist {
  catalogArtistId: string | null;
  name: string;
  image: string | null;
}

const api = vi.hoisted(() => ({
  discography: undefined as { groups: { recordType: string; albums: DiscographyAlbum[] }[] } | undefined,
  discographyLoading: false,
  discographyArgs: vi.fn(),
  similar: undefined as SimilarArtist[] | undefined,
  similarLoading: false,
}));

vi.mock("@hooks/api/queries/content-detail", () => ({
  useArtistDiscography: (args: unknown) => {
    api.discographyArgs(args);
    return { data: api.discography, isLoading: api.discographyLoading };
  },
  useArtistSimilar: () => ({ data: api.similar, isLoading: api.similarLoading }),
}));

import { ArtistDiscographyWidget } from "../ArtistDiscographyWidget";
import { ArtistSimilarWidget } from "../ArtistSimilarWidget";
import { MoreFromArtistWidget } from "../MoreFromArtistWidget";

function album(externalId: string, title: string): DiscographyAlbum {
  return { externalId, title, image: null, inLibrary: false, libraryTrackCount: 0, totalTracks: 10 };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.discography = undefined;
  api.discographyLoading = false;
  api.similar = undefined;
  api.similarLoading = false;
  Element.prototype.scrollBy = vi.fn();
});

describe("the discography", () => {
  function renderDiscography() {
    const onSelectAlbum = vi.fn();
    render(<ArtistDiscographyWidget catalogArtistId="artist-1" artistName="Daft Punk" onSelectAlbum={onSelectAlbum} />);
    return { onSelectAlbum, user: userEvent.setup() };
  }

  it("says the artist has no releases rather than showing an empty rail", () => {
    api.discography = { groups: [] };

    renderDiscography();

    expect(screen.getByText(enContentDetail.empty.discography)).toBeInTheDocument();
  });

  it("lists the releases of the group it opens on", () => {
    api.discography = { groups: [{ recordType: "album", albums: [album("a1", "Discovery")] }] };

    renderDiscography();

    expect(screen.getByText("Discovery")).toBeInTheDocument();
  });

  it("offers no tabs when the artist has only one kind of release", () => {
    api.discography = { groups: [{ recordType: "album", albums: [album("a1", "Discovery")] }] };

    renderDiscography();

    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("offers a tab per kind of release, each with its count", () => {
    api.discography = {
      groups: [
        { recordType: "album", albums: [album("a1", "Discovery")] },
        { recordType: "single", albums: [album("s1", "One More Time"), album("s2", "Aerodynamic")] },
      ],
    };

    renderDiscography();

    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("switches the rail to the kind the listener picked", async () => {
    api.discography = {
      groups: [
        { recordType: "album", albums: [album("a1", "Discovery")] },
        { recordType: "single", albums: [album("s1", "One More Time")] },
      ],
    };
    const { user } = renderDiscography();

    await user.click(screen.getAllByRole("tab")[1] ?? document.body);

    expect(screen.getByText("One More Time")).toBeInTheDocument();
    expect(screen.queryByText("Discovery")).not.toBeInTheDocument();
  });

  it("opens the release the listener chose, carrying the artist with it", async () => {
    api.discography = { groups: [{ recordType: "album", albums: [album("a1", "Discovery")] }] };
    const { onSelectAlbum, user } = renderDiscography();

    await user.click(screen.getByText("Discovery"));

    expect(onSelectAlbum).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "album", id: "a1", name: "Discovery", artistName: "Daft Punk" })
    );
  });
});

describe("the artist's other albums, shown on an album page", () => {
  function renderMoreFrom(artistExternalId: string | null, excludeAlbumId = "current") {
    const onSelectAlbum = vi.fn();
    const result = render(
      <MoreFromArtistWidget
        artistExternalId={artistExternalId}
        artistName="Daft Punk"
        excludeAlbumId={excludeAlbumId}
        onSelectAlbum={onSelectAlbum}
      />
    );
    return { ...result, onSelectAlbum, user: userEvent.setup() };
  }

  it("shows nothing at all until the catalog has named the artist", () => {
    const { container } = renderMoreFrom(null);

    expect(container).toBeEmptyDOMElement();
    expect(api.discographyArgs).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("leaves out the album the listener is already looking at", () => {
    api.discography = {
      groups: [{ recordType: "album", albums: [album("current", "Discovery"), album("a2", "Homework")] }],
    };

    renderMoreFrom("artist-1");

    expect(screen.queryByText("Discovery")).not.toBeInTheDocument();
    expect(screen.getByText("Homework")).toBeInTheDocument();
  });

  it("takes the whole rail away when the artist has only this one album", () => {
    api.discography = { groups: [{ recordType: "album", albums: [album("current", "Discovery")] }] };

    renderMoreFrom("artist-1");

    expect(
      screen.queryByText(enContentDetail.sections.moreFrom.replace("{{name}}", "Daft Punk"))
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enContentDetail.rail.next })).not.toBeInTheDocument();
  });

  it("shows a placeholder in the rail's place while it is still being fetched", () => {
    api.discographyLoading = true;

    renderMoreFrom("artist-1");

    expect(screen.getByText(enContentDetail.sections.moreFrom.replace("{{name}}", "Daft Punk"))).toBeInTheDocument();
  });

  it("scrolls the rail in both directions", async () => {
    api.discography = {
      groups: [{ recordType: "album", albums: [album("a1", "Homework"), album("a2", "Human After All")] }],
    };
    const { user } = renderMoreFrom("artist-1");

    await user.click(screen.getByRole("button", { name: enContentDetail.rail.next }));
    await user.click(screen.getByRole("button", { name: enContentDetail.rail.prev }));

    expect(Element.prototype.scrollBy).toHaveBeenCalledTimes(2);
  });

  it("opens the album the listener chose off the rail", async () => {
    api.discography = { groups: [{ recordType: "album", albums: [album("a2", "Homework")] }] };
    const { onSelectAlbum, user } = renderMoreFrom("artist-1");

    await user.click(screen.getByText("Homework"));

    expect(onSelectAlbum).toHaveBeenCalledWith(expect.objectContaining({ id: "a2", artistName: "Daft Punk" }));
  });
});

describe("the similar artists", () => {
  function renderSimilar() {
    const onSelectArtist = vi.fn();
    render(<ArtistSimilarWidget artistName="Daft Punk" onSelectArtist={onSelectArtist} />);
    return { onSelectArtist, user: userEvent.setup() };
  }

  it("says there are none rather than showing an empty rail", () => {
    api.similar = [];

    renderSimilar();

    expect(screen.getByText(enContentDetail.empty.similar)).toBeInTheDocument();
  });

  it("lists the artists the catalog suggested", () => {
    api.similar = [{ catalogArtistId: "artist-2", name: "Air", image: null }];

    renderSimilar();

    expect(screen.getByText("Air")).toBeInTheDocument();
  });

  it("opens the artist the listener chose", async () => {
    api.similar = [{ catalogArtistId: "artist-2", name: "Air", image: null }];
    const { onSelectArtist, user } = renderSimilar();

    await user.click(screen.getByText("Air"));

    expect(onSelectArtist).toHaveBeenCalledWith(expect.objectContaining({ mode: "artist", id: "artist-2" }));
  });

  it("goes nowhere for a suggestion the catalog could not resolve", async () => {
    api.similar = [{ catalogArtistId: null, name: "Stardust", image: null }];
    const { onSelectArtist, user } = renderSimilar();

    await user.click(screen.getByText("Stardust"));

    expect(onSelectArtist).not.toHaveBeenCalled();
  });

  it("scrolls the rail in both directions", async () => {
    api.similar = [
      { catalogArtistId: "artist-2", name: "Air", image: null },
      { catalogArtistId: "artist-3", name: "Justice", image: null },
    ];
    const { user } = renderSimilar();

    await user.click(screen.getByRole("button", { name: enContentDetail.rail.next }));
    await user.click(screen.getByRole("button", { name: enContentDetail.rail.prev }));

    expect(Element.prototype.scrollBy).toHaveBeenCalledTimes(2);
  });
});
