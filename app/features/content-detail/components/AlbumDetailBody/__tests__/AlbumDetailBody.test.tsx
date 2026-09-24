import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DetailTarget } from "../../../types";

interface AlbumTrack {
  id: string;
  status: string | null;
}

const api = vi.hoisted(() => ({
  album: undefined as Record<string, unknown> | undefined,
  stats: undefined as Record<string, unknown> | undefined,
  credits: undefined as Record<string, unknown> | undefined,
  statsArgs: vi.fn(),
}));

vi.mock("@hooks/api/queries/content-detail", () => ({
  useAlbumDetail: () => ({ data: api.album }),
  useAlbumStats: (args: unknown) => {
    api.statsArgs(args);
    return { data: api.stats };
  },
  useAlbumCredits: () => ({ data: api.credits }),
}));

const playback = vi.hoisted(() => ({ playEntity: vi.fn(), startRadio: vi.fn() }));

vi.mock("@hooks/ui/useEntityPlayback", () => ({
  useEntityPlayback: () => ({ playEntity: playback.playEntity, startRadio: playback.startRadio }),
}));

const actions = vi.hoisted(() => ({ requestAlbum: vi.fn() }));

vi.mock("../../../ContentDetailActionsContext", () => ({
  useContentDetailActions: () => ({ requestAlbum: actions.requestAlbum }),
}));

const hero = vi.hoisted(() => ({
  props: null as Record<string, unknown> | null,
}));

vi.mock("../../DetailHero/DetailHero", () => ({
  DetailHero: (props: Record<string, unknown>) => {
    hero.props = props;
    return (
      <div data-testid="hero">
        <button type="button" onClick={props.onRequest as () => void}>
          request
        </button>
        {typeof props.onPlay === "function" ? (
          <button type="button" onClick={props.onPlay as () => void}>
            play
          </button>
        ) : null}
        {typeof props.onStartRadio === "function" ? (
          <button type="button" onClick={props.onStartRadio as () => void}>
            radio
          </button>
        ) : null}
        {typeof props.onSubtitleClick === "function" ? (
          <button type="button" onClick={props.onSubtitleClick as () => void}>
            go to artist
          </button>
        ) : null}
      </div>
    );
  },
}));

vi.mock("../../../widgets", () => ({
  AlbumCreditsWidget: () => <div data-testid="credits" />,
  AlbumDetailWidget: () => <div data-testid="tracklist" />,
  AlbumStatsWidget: ({ slot }: { slot: string }) => <div data-testid={`stats-${slot}`} />,
  MoreFromArtistWidget: ({ onSelectAlbum }: { onSelectAlbum: (target: DetailTarget) => void }) => (
    <button
      type="button"
      data-testid="more-from-artist"
      onClick={() =>
        onSelectAlbum({ mode: "album", id: "other", name: "Human After All", artistName: "Daft Punk", cover: null })
      }
    >
      more
    </button>
  ),
}));

import { AlbumDetailBody } from "../AlbumDetailBody";

function target(overrides: Partial<DetailTarget> = {}): DetailTarget {
  return { mode: "album", id: "album-1", name: "Discovery", artistName: "Daft Punk", cover: null, ...overrides };
}

function albumWith(tracks: AlbumTrack[], overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    artist: "Daft Punk",
    artistExternalId: "artist-1",
    genres: ["house"],
    totalTracks: tracks.length,
    cover: "/cover.jpg",
    tracks,
    releaseDate: "2001-03-12",
    label: "Virgin",
    recordType: "album",
    length: "60:00",
    degraded: undefined,
    ...overrides,
  };
}

function renderBody(overrides: Partial<DetailTarget> = {}) {
  const onNavigate = vi.fn();
  render(<AlbumDetailBody target={target(overrides)} onNavigate={onNavigate} />);
  return { onNavigate, user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.album = undefined;
  api.stats = undefined;
  api.credits = undefined;
  hero.props = null;
});

describe("what the album page shows", () => {
  it("lays out the tracklist, the facts and the artist's other albums", () => {
    renderBody();

    expect(screen.getByTestId("tracklist")).toBeInTheDocument();
    expect(screen.getByTestId("credits")).toBeInTheDocument();
    expect(screen.getByTestId("stats-about")).toBeInTheDocument();
    expect(screen.getByTestId("more-from-artist")).toBeInTheDocument();
  });

  it("uses the name the caller already had before the album has been fetched", () => {
    renderBody();

    expect(hero.props?.name).toBe("Discovery");
    expect(hero.props?.subtitle).toBe("Daft Punk");
  });

  it("prefers the artwork the catalog returned over the one the caller had", () => {
    api.album = albumWith([]);

    renderBody({ cover: "/thumbnail.jpg" });

    expect(hero.props?.cover).toBe("/cover.jpg");
  });

  it("falls back to the caller's artwork while the album is still being fetched", () => {
    renderBody({ cover: "/thumbnail.jpg" });

    expect(hero.props?.cover).toBe("/thumbnail.jpg");
  });

  it("looks the album's listening figures up under the artist the catalog named", () => {
    api.album = albumWith([], { artist: "Daft Punk (FR)" });

    renderBody();

    expect(api.statsArgs).toHaveBeenCalledWith(expect.objectContaining({ artistName: "Daft Punk (FR)" }));
  });

  it("gathers the sources that could not be reached across every fetch", () => {
    api.album = albumWith([], { degraded: [{ source: "lastfm", unavailableForSeconds: null }] });
    api.credits = { degraded: [{ source: "musicbrainz", unavailableForSeconds: 30 }] };

    renderBody();

    expect(hero.props?.degradedSources).toHaveLength(2);
  });
});

describe("what the album page offers", () => {
  it("asks for the album under the name and artwork on screen", async () => {
    api.album = albumWith([]);
    const { user } = renderBody();

    await user.click(screen.getByRole("button", { name: "request" }));

    expect(actions.requestAlbum).toHaveBeenCalledWith({
      id: "album-1",
      name: "Discovery",
      artistName: "Daft Punk",
      cover: "/cover.jpg",
      genres: ["house"],
    });
  });

  it("offers no play button for an album the library does not hold yet", () => {
    api.album = albumWith([{ id: "t1", status: null }]);

    renderBody();

    expect(screen.queryByRole("button", { name: "play" })).not.toBeInTheDocument();
  });

  it("plays the album once the library holds at least one of its tracks", async () => {
    api.album = albumWith([{ id: "t1", status: "complete" }]);
    const { user } = renderBody();

    await user.click(screen.getByRole("button", { name: "play" }));

    expect(playback.playEntity).toHaveBeenCalledWith({ kind: "album", albumExternalId: "album-1" });
  });

  it("offers no radio for an album the library does not hold yet", () => {
    api.album = albumWith([{ id: "t1", status: null }]);

    renderBody();

    expect(screen.queryByRole("button", { name: "radio" })).not.toBeInTheDocument();
  });

  it("starts a radio from the album once the library holds at least one of its tracks", async () => {
    api.album = albumWith([{ id: "t1", status: "complete" }]);
    const { user } = renderBody();

    await user.click(screen.getByRole("button", { name: "radio" }));

    expect(playback.startRadio).toHaveBeenCalledWith({ kind: "album", albumExternalId: "album-1" });
  });

  it("offers no jump to the artist until the catalog has named one", () => {
    renderBody();

    expect(screen.queryByRole("button", { name: "go to artist" })).not.toBeInTheDocument();
  });

  it("jumps to the artist the catalog named", async () => {
    api.album = albumWith([]);
    const { onNavigate, user } = renderBody();

    await user.click(screen.getByRole("button", { name: "go to artist" }));

    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ mode: "artist", id: "artist-1" }));
  });

  it("opens another album of the artist's in the same modal", async () => {
    const { onNavigate, user } = renderBody();

    await user.click(screen.getByTestId("more-from-artist"));

    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: "other" }));
  });
});
