import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen, waitFor } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

import type { DetailTarget } from "../../../types";

const playlistDetail = vi.fn();
const playback = vi.hoisted(() => ({
  playEntity: vi.fn(async () => true),
  shuffleEntity: vi.fn(async () => true),
  enqueueEntity: vi.fn(async () => true),
}));
const layout = vi.hoisted(() => ({ columns: true }));
const seen = vi.hoisted(() => ({ tracks: null as unknown, details: null as unknown }));

vi.mock("@hooks/api/queries/content-detail", () => ({
  usePlaylistDetail: (args: unknown) => playlistDetail(args),
}));
vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => playback }));
vi.mock("@hooks/ui/useMediaQuery", () => ({ useMediaQuery: () => layout.columns }));
vi.mock("../../../hooks/useTrackArtistNavigation", () => ({ useTrackArtistNavigation: () => vi.fn() }));
vi.mock("@components/SuggestedTracks", () => ({
  SuggestedTracks: ({ playlistId }: { playlistId: string }) => <div data-testid="suggested">{playlistId}</div>,
}));
const orderSaves: (() => void)[] = [];
const saveOrder = vi.fn(
  (_input: { playlistId: string; trackIds: string[] }) =>
    new Promise<void>((resolve) => {
      orderSaves.push(resolve);
    })
);
vi.mock("@hooks/api/mutations/playlists/useReorderPlaylistTracks", () => ({
  useReorderPlaylistTracks: () => saveOrder,
}));
vi.mock("../WorkshopTracks", () => ({
  WorkshopTracks: (props: {
    lock: string | null;
    order: { ordered: { requestId: string }[]; placeSoon: (ids: string[]) => void };
  }) => {
    seen.tracks = props;
    return (
      <div>
        <div data-testid="tracks">{props.order.ordered.length}</div>
        <button
          type="button"
          onClick={() => props.order.placeSoon(props.order.ordered.map((row) => row.requestId).reverse())}
        >
          reverse by keyboard
        </button>
      </div>
    );
  },
}));
vi.mock("../WorkshopDetails", () => ({
  WorkshopDetails: (props: Record<string, unknown>) => {
    seen.details = props;
    return <div data-testid="details" />;
  },
}));

import { PlaylistWorkshop } from "../PlaylistWorkshop";

const TARGET: DetailTarget = {
  mode: "playlist",
  id: "pl-1",
  name: "Road Trip",
  artistName: "Road Trip",
  cover: null,
  playlistSource: "library",
};

function track(index: number, requestId: string | null) {
  return { externalId: `ext-${index}`, title: `Song ${index}`, durationMs: 120_000, requestId };
}

function loaded(overrides?: Record<string, unknown>) {
  return {
    isError: false,
    data: {
      id: "pl-1",
      name: "Road Trip",
      cover: "/api/v1/playlist-covers/pl-1/abc",
      hasCustomCover: true,
      origin: { kind: "created" },
      visibility: "shared",
      sourceProvider: null,
      syncEnabled: false,
      nameLock: null,
      tracksLock: null,
      libraryTrackCount: 2,
      tracks: [track(1, "req-1"), track(2, "req-2"), track(3, null)],
      ...overrides,
    },
  };
}

function workshop() {
  const handlers = { onExit: vi.fn(), onClose: vi.fn(), onNavigate: vi.fn() };
  renderWithProviders(<PlaylistWorkshop target={TARGET} {...handlers} />);
  return handlers;
}

beforeEach(() => {
  vi.clearAllMocks();
  orderSaves.length = 0;
  layout.columns = true;
  seen.tracks = null;
  seen.details = null;
});

describe("PlaylistWorkshop", () => {
  it("lays out details, tracks and suggestions side by side on a wide screen, without tabs", () => {
    playlistDetail.mockReturnValue(loaded());
    workshop();

    expect(screen.getByTestId("details")).toBeInTheDocument();
    expect(screen.getByTestId("tracks")).toHaveTextContent("2");
    expect(screen.getByTestId("suggested")).toHaveTextContent("pl-1");
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(seen.tracks).toMatchObject({ playlistId: "pl-1", lock: null });
    expect(seen.details).toMatchObject({
      canRename: true,
      canEditTracks: true,
      hasCustomCover: true,
      cover: "/api/v1/playlist-covers/pl-1/abc",
      trackCount: 2,
      minutes: 4,
      inLibrary: 2,
    });
  });

  it("offers no suggestions on a playlist whose tracks are locked, and passes the lock on", () => {
    playlistDetail.mockReturnValue(loaded({ tracksLock: "rule" }));
    workshop();

    expect(screen.queryByTestId("suggested")).not.toBeInTheDocument();
    expect(seen.tracks).toMatchObject({ lock: "rule" });
    expect(seen.details).toMatchObject({ canEditTracks: false, canRename: true });
  });

  it("locks the name of a synced playlist", () => {
    playlistDetail.mockReturnValue(loaded({ nameLock: "synced", tracksLock: "synced" }));
    workshop();

    expect(seen.details).toMatchObject({ canRename: false });
  });

  it("switches between tracks, suggestions and details by tab on a narrow screen", async () => {
    layout.columns = false;
    playlistDetail.mockReturnValue(loaded());
    workshop();

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["Tracks2", "Suggested", "Details"]);
    expect(screen.getByTestId("tracks")).toBeInTheDocument();
    expect(screen.queryByTestId("suggested")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Suggested" }));
    expect(screen.getByTestId("suggested")).toBeInTheDocument();
    expect(screen.queryByTestId("tracks")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Details" }));
    expect(screen.getByTestId("details")).toBeInTheDocument();
    expect(screen.queryByTestId("suggested")).not.toBeInTheDocument();
  });

  it("drops the suggestions tab on a locked playlist", () => {
    layout.columns = false;
    playlistDetail.mockReturnValue(loaded({ tracksLock: "synced" }));
    workshop();

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["Tracks2", "Details"]);
  });

  it("plays the whole playlist from the header and leaves through the exit button", async () => {
    playlistDetail.mockReturnValue(loaded());
    const { onExit } = workshop();

    await userEvent.click(screen.getByRole("button", { name: /^Play/ }));
    expect(playback.playEntity).toHaveBeenCalledWith({ kind: "playlist", playlistId: "pl-1" });

    await userEvent.click(screen.getByRole("button", { name: "Exit workshop" }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("saves a keyboard move that is still waiting before it plays, and plays only once that save has settled", async () => {
    playlistDetail.mockReturnValue(loaded());
    workshop();

    await userEvent.click(screen.getByRole("button", { name: "reverse by keyboard" }));
    expect(saveOrder).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: /^Play/ }));

    await waitFor(() => expect(saveOrder).toHaveBeenCalledTimes(1));
    expect(saveOrder.mock.calls[0]?.[0]).toEqual({ playlistId: "pl-1", trackIds: ["req-2", "req-1"] });
    expect(playback.playEntity).not.toHaveBeenCalled();

    orderSaves[0]?.();

    await waitFor(() => expect(playback.playEntity).toHaveBeenCalledWith({ kind: "playlist", playlistId: "pl-1" }));
  });

  it("hands the details pane the same wait, for the exports and the import", () => {
    playlistDetail.mockReturnValue(loaded());
    workshop();

    expect(seen.details).toMatchObject({ settleOrder: expect.any(Function) });
  });

  it("shows the name it was opened with while loading, and an error when the playlist cannot be read", () => {
    playlistDetail.mockReturnValue({ isError: false, data: undefined });
    workshop();
    expect(screen.getByRole("heading", { name: "Road Trip" })).toBeInTheDocument();
    expect(screen.queryByTestId("tracks")).not.toBeInTheDocument();
  });

  it("reports a playlist that failed to load", () => {
    playlistDetail.mockReturnValue({ isError: true, data: undefined });
    workshop();
    expect(screen.getByText("This could not be loaded. Close it and try again.")).toBeInTheDocument();
    expect(screen.queryByTestId("tracks")).not.toBeInTheDocument();
  });
});
