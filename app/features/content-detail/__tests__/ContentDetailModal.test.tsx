import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import enContentDetail from "@modules/i18n/messages/en/contentDetail.json";

import { MINI_HEADER_SCROLL_THRESHOLD } from "../constants";
import type { ContentDetailActions, DetailTarget } from "../types";

const api = vi.hoisted(() => ({
  identity: undefined as { image: string | null } | undefined,
  album: undefined as { cover: string | null } | undefined,
  playlist: undefined as { cover: string | null } | undefined,
  albumArgs: vi.fn(),
  playlistArgs: vi.fn(),
  identityArgs: vi.fn(),
}));

vi.mock("@hooks/api/queries/content-detail", () => ({
  useArtistIdentity: (args: unknown) => {
    api.identityArgs(args);
    return { data: api.identity };
  },
  useAlbumDetail: (args: unknown) => {
    api.albumArgs(args);
    return { data: api.album };
  },
  usePlaylistDetail: (args: unknown) => {
    api.playlistArgs(args);
    return { data: api.playlist };
  },
}));

const bodies = vi.hoisted(() => ({ navigate: null as ((target: DetailTarget) => void) | null }));

vi.mock("../components/ArtistDetailBody", () => ({
  ArtistDetailBody: ({ target, onNavigate }: { target: DetailTarget; onNavigate: (next: DetailTarget) => void }) => {
    bodies.navigate = onNavigate;
    return <div data-testid="artist-body">{target.name}</div>;
  },
}));

vi.mock("../components/AlbumDetailBody", () => ({
  AlbumDetailBody: ({
    target,
    onNavigate,
    showInLibraryPill,
  }: {
    target: DetailTarget;
    onNavigate: (next: DetailTarget) => void;
    showInLibraryPill: boolean;
  }) => {
    bodies.navigate = onNavigate;
    return (
      <div data-testid="album-body" data-library-pill={String(showInLibraryPill)}>
        {target.name}
      </div>
    );
  },
}));

vi.mock("../components/PlaylistDetailBody", () => ({
  PlaylistDetailBody: ({ target, onClose }: { target: DetailTarget; onClose: () => void }) => (
    <div data-testid="playlist-body">
      {target.name}
      <button type="button" onClick={onClose}>
        close from body
      </button>
    </div>
  ),
}));

import { ContentDetailModal } from "../ContentDetailModal";

function actions(): ContentDetailActions {
  return {
    requestAlbum: vi.fn(),
    requestArtist: vi.fn(),
    requestTrack: vi.fn(),
    requestPlaylist: vi.fn(),
  };
}

function target(overrides: Partial<DetailTarget> = {}): DetailTarget {
  return { mode: "album", id: "album-1", name: "Discovery", artistName: "Daft Punk", cover: null, ...overrides };
}

function renderModal(overrides: Partial<DetailTarget> | null = {}) {
  const onClose = vi.fn();
  render(
    <ContentDetailModal
      open
      onClose={onClose}
      target={overrides === null ? null : target(overrides)}
      actions={actions()}
    />
  );
  return { onClose, user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.identity = undefined;
  api.album = undefined;
  api.playlist = undefined;
  bodies.navigate = null;
});

describe("what the modal shows", () => {
  it("shows nothing at all before a target has been chosen", () => {
    const { container } = render(<ContentDetailModal open onClose={vi.fn()} target={null} actions={actions()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the album body for an album", () => {
    renderModal();

    expect(screen.getByTestId("album-body")).toHaveTextContent("Discovery");
  });

  it("shows the artist body for an artist", () => {
    renderModal({ mode: "artist", id: "artist-1", name: "Daft Punk" });

    expect(screen.getByTestId("artist-body")).toHaveTextContent("Daft Punk");
  });

  it("shows the playlist body for a playlist", () => {
    renderModal({ mode: "playlist", id: "playlist-1", name: "Summer" });

    expect(screen.getByTestId("playlist-body")).toHaveTextContent("Summer");
  });

  it("names the entry for a screen reader", () => {
    renderModal();

    expect(screen.getByText(enContentDetail.dialogTitle.replace("{{name}}", "Discovery"))).toBeInTheDocument();
  });
});

describe("what the modal fetches", () => {
  it("fetches the album only while an album is on top", () => {
    renderModal();

    expect(api.albumArgs).toHaveBeenCalledWith(expect.objectContaining({ catalogAlbumId: "album-1", enabled: true }));
    expect(api.identityArgs).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("fetches the artist identity only while an artist is on top", () => {
    renderModal({ mode: "artist", id: "artist-1", name: "Daft Punk" });

    expect(api.identityArgs).toHaveBeenCalledWith(
      expect.objectContaining({ catalogArtistId: "artist-1", enabled: true })
    );
    expect(api.albumArgs).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("fetches a library playlist, which the server holds", () => {
    renderModal({ mode: "playlist", id: "playlist-1", name: "Summer" });

    expect(api.playlistArgs).toHaveBeenCalledWith(expect.objectContaining({ playlistId: "playlist-1", enabled: true }));
  });

  it("does not fetch a playlist whose tracks came with it", () => {
    renderModal({ mode: "playlist", id: "playlist-1", name: "Summer", preloadedTracks: [] });

    expect(api.playlistArgs).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("does not fetch a playlist the catalog owns rather than the library", () => {
    renderModal({ mode: "playlist", id: "playlist-1", name: "Summer", playlistSource: "catalog" });

    expect(api.playlistArgs).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });
});

describe("moving between entries", () => {
  it("offers no way back from the first entry", () => {
    renderModal();

    expect(screen.queryByText(enContentDetail.backFallback)).not.toBeInTheDocument();
  });

  it("names the entry it came from once the listener goes deeper", () => {
    renderModal();

    fireEvent.click(screen.getByTestId("album-body"));
    act(() =>
      bodies.navigate?.({ mode: "artist", id: "artist-1", name: "Daft Punk", artistName: "Daft Punk", cover: null })
    );

    expect(screen.getByTestId("artist-body")).toBeInTheDocument();
    expect(screen.getAllByText("Discovery").length).toBeGreaterThan(0);
  });

  it("goes back to the entry underneath", async () => {
    const { user } = renderModal();
    act(() =>
      bodies.navigate?.({ mode: "artist", id: "artist-1", name: "Daft Punk", artistName: "Daft Punk", cover: null })
    );

    await user.click(screen.getByRole("button", { name: enContentDetail.back.replace("{{name}}", "Discovery") }));

    expect(screen.getByTestId("album-body")).toBeInTheDocument();
  });
});

describe("the sticky header", () => {
  function scrollingShell(): HTMLElement {
    const shell = document.querySelector("[data-testid=album-body]")?.parentElement;
    if (!(shell instanceof HTMLElement)) throw new Error("the modal rendered no scrolling shell");
    return shell;
  }

  function miniHeader(): HTMLElement {
    const named = screen.getAllByText("Discovery").map((node) => node.closest("[aria-hidden]"));
    const bar = named.find((node) => node !== null);
    if (!(bar instanceof HTMLElement)) throw new Error("the modal rendered no mini header");
    return bar;
  }

  it("comes forward once the listener has scrolled past the hero", () => {
    renderModal();

    fireEvent.scroll(scrollingShell(), { target: { scrollTop: MINI_HEADER_SCROLL_THRESHOLD + 1 } });

    expect(miniHeader()).toHaveAttribute("aria-hidden", "false");
  });

  it("stays out of the way while the hero is still on screen", () => {
    renderModal();

    fireEvent.scroll(scrollingShell(), { target: { scrollTop: MINI_HEADER_SCROLL_THRESHOLD - 1 } });

    expect(miniHeader()).toHaveAttribute("aria-hidden", "true");
  });

  it("is out of the way before the listener has scrolled at all", () => {
    renderModal();

    expect(miniHeader()).toHaveAttribute("aria-hidden", "true");
  });

  it("goes back out of the way when the listener scrolls up again", () => {
    renderModal();
    const shell = scrollingShell();
    fireEvent.scroll(shell, { target: { scrollTop: MINI_HEADER_SCROLL_THRESHOLD + 1 } });

    fireEvent.scroll(shell, { target: { scrollTop: 0 } });

    expect(miniHeader()).toHaveAttribute("aria-hidden", "true");
  });
});

describe("closing the modal", () => {
  it("tells the caller when the body asks to close", async () => {
    const onClose = vi.fn();
    render(
      <ContentDetailModal
        open
        onClose={onClose}
        target={target({ mode: "playlist", id: "playlist-1", name: "Summer" })}
        actions={actions()}
      />
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "close from body" }));

    expect(onClose).toHaveBeenCalled();
  });
});
