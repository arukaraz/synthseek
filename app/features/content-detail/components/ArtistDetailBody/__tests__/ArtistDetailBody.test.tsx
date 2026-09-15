import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DetailTarget } from "../../../types";

const api = vi.hoisted(() => ({
  identity: undefined as Record<string, unknown> | undefined,
  stats: undefined as Record<string, unknown> | undefined,
  lidarr: undefined as { available: boolean } | undefined,
  statsArgs: vi.fn(),
}));

vi.mock("@hooks/api/queries/content-detail", () => ({
  useArtistIdentity: () => ({ data: api.identity }),
  useArtistStats: (args: unknown) => {
    api.statsArgs(args);
    return { data: api.stats };
  },
}));

vi.mock("@hooks/api/queries/useLidarrAvailable", () => ({ useLidarrAvailable: () => ({ data: api.lidarr }) }));

const playback = vi.hoisted(() => ({ playEntity: vi.fn() }));

vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity: playback.playEntity }) }));

const actions = vi.hoisted(() => ({ requestArtist: vi.fn() }));

vi.mock("../../../ContentDetailActionsContext", () => ({
  useContentDetailActions: () => ({ requestArtist: actions.requestArtist }),
}));

const hero = vi.hoisted(() => ({ props: null as Record<string, unknown> | null }));

vi.mock("../../DetailHero/DetailHero", () => ({
  DetailHero: (props: Record<string, unknown>) => {
    hero.props = props;
    return (
      <div data-testid="hero">
        <button type="button" onClick={props.onRequest as () => void}>
          request
        </button>
        <button type="button" onClick={props.onPlay as () => void}>
          play
        </button>
      </div>
    );
  },
}));

vi.mock("../../../widgets", () => ({
  ArtistDiscographyWidget: ({ onSelectAlbum }: { onSelectAlbum: (target: DetailTarget) => void }) => (
    <button
      type="button"
      data-testid="discography"
      onClick={() =>
        onSelectAlbum({ mode: "album", id: "album-9", name: "Discovery", artistName: "Daft Punk", cover: null })
      }
    >
      discography
    </button>
  ),
  ArtistIdentityWidget: () => <div data-testid="identity" />,
  ArtistSimilarWidget: ({ onSelectArtist }: { onSelectArtist: (target: DetailTarget) => void }) => (
    <button
      type="button"
      data-testid="similar"
      onClick={() => onSelectArtist({ mode: "artist", id: "artist-9", name: "Air", artistName: "Air", cover: null })}
    >
      similar
    </button>
  ),
  ArtistStatsWidget: ({ slot }: { slot: string }) => <div data-testid={`stats-${slot}`} />,
  ArtistTopTracksWidget: () => <div data-testid="top-tracks" />,
}));

import { ArtistDetailBody } from "../ArtistDetailBody";

function target(overrides: Partial<DetailTarget> = {}): DetailTarget {
  return { mode: "artist", id: "artist-1", name: "Daft Punk", artistName: "Daft Punk", cover: null, ...overrides };
}

function renderBody(overrides: Partial<DetailTarget> = {}) {
  const onNavigate = vi.fn();
  render(<ArtistDetailBody target={target(overrides)} onNavigate={onNavigate} />);
  return { onNavigate, user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.identity = undefined;
  api.stats = undefined;
  api.lidarr = undefined;
  hero.props = null;
});

describe("what the artist page shows", () => {
  it("lays out the top tracks, the identity, the discography and the similar artists", () => {
    renderBody();

    expect(screen.getByTestId("top-tracks")).toBeInTheDocument();
    expect(screen.getByTestId("identity")).toBeInTheDocument();
    expect(screen.getByTestId("discography")).toBeInTheDocument();
    expect(screen.getByTestId("similar")).toBeInTheDocument();
    expect(screen.getByTestId("stats-about")).toBeInTheDocument();
  });

  it("prefers the picture the catalog returned over the one the caller had", () => {
    api.identity = { image: "/artist.jpg", mbid: "mbid-1", socials: undefined, degraded: undefined };

    renderBody({ cover: "/thumbnail.jpg" });

    expect(hero.props?.cover).toBe("/artist.jpg");
  });

  it("falls back to the caller's picture while the identity is still being fetched", () => {
    renderBody({ cover: "/thumbnail.jpg" });

    expect(hero.props?.cover).toBe("/thumbnail.jpg");
  });

  it("looks the figures up against the identifier the catalog resolved", () => {
    api.identity = { image: null, mbid: "mbid-1" };

    renderBody();

    expect(api.statsArgs).toHaveBeenCalledWith({ artistName: "Daft Punk", mbid: "mbid-1" });
  });

  it("shows the genres the figures came back with", () => {
    api.stats = { genres: ["house", "french touch"] };

    renderBody();

    expect(hero.props?.genres).toEqual(["house", "french touch"]);
  });

  it("gathers the sources that could not be reached across both fetches", () => {
    api.identity = { image: null, mbid: null, degraded: [{ source: "lastfm", unavailableForSeconds: null }] };
    api.stats = { genres: [], degraded: [{ source: "musicbrainz", unavailableForSeconds: 10 }] };

    renderBody();

    expect(hero.props?.degradedSources).toHaveLength(2);
  });
});

describe("what the artist page offers", () => {
  it("hides the request button on an instance with no Lidarr to send it to", () => {
    renderBody();

    expect(hero.props?.showRequest).toBe(false);
  });

  it("offers the request once Lidarr is reachable", () => {
    api.lidarr = { available: true };

    renderBody();

    expect(hero.props?.showRequest).toBe(true);
  });

  it("asks for the artist under the picture on screen", async () => {
    api.identity = { image: "/artist.jpg", mbid: null };
    const { user } = renderBody();

    await user.click(screen.getByRole("button", { name: "request" }));

    expect(actions.requestArtist).toHaveBeenCalledWith({ id: "artist-1", name: "Daft Punk", cover: "/artist.jpg" });
  });

  it("plays everything the library holds by the artist", async () => {
    const { user } = renderBody();

    await user.click(screen.getByRole("button", { name: "play" }));

    expect(playback.playEntity).toHaveBeenCalledWith({ kind: "artist", artist: "Daft Punk" });
  });

  it("opens an album out of the discography in the same modal", async () => {
    const { onNavigate, user } = renderBody();

    await user.click(screen.getByTestId("discography"));

    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ mode: "album", id: "album-9" }));
  });

  it("opens a similar artist in the same modal", async () => {
    const { onNavigate, user } = renderBody();

    await user.click(screen.getByTestId("similar"));

    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ mode: "artist", id: "artist-9" }));
  });
});
