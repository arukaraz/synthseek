import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen, waitFor } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

const remove = vi.fn<(input: { playlistId: string; removed: unknown[]; skipped: boolean }) => Promise<boolean>>();
const next = vi.hoisted(() => vi.fn());
const playing = vi.hoisted(() => ({ id: "a" }));

vi.mock("@hooks/api", () => ({ useRetryTracks: () => ({ mutate: vi.fn(), isPending: false }) }));
vi.mock("@hooks/api/mutations/playlists/useRemovePlaylistTracksWithUndo", () => ({
  useRemovePlaylistTracksWithUndo: () => ({ remove, isPending: false }),
}));
const orderSaves: (() => void)[] = [];
const saveOrder = vi.fn(
  (_input: { playlistId: string; trackIds: string[] }) =>
    new Promise<void>((resolve) => {
      orderSaves.push(resolve);
    })
);

const playEntityFrom = vi.hoisted(() => vi.fn(async () => true));

vi.mock("@hooks/ui/player", () => ({
  playerActions: { next, togglePlay: vi.fn() },
  usePlayerResumableHere: () => false,
  useQueuePresence: () => (id: string) => (id === playing.id ? "playing" : "absent"),
}));
vi.mock("@hooks/ui/useEntityPlayback", () => ({
  useEntityPlayback: () => ({ playEntityFrom, enqueueEntity: vi.fn(), playNextEntity: vi.fn() }),
}));
vi.mock("../WorkshopTrackRow", () => ({
  WorkshopTrackRow: ({
    track,
    onRemove,
    onNudge,
    onPlay,
  }: {
    track: { title: string };
    onRemove: () => void;
    onNudge: (delta: number) => void;
    onPlay?: () => Promise<unknown>;
  }) => (
    <li>
      <button type="button" onClick={() => void onPlay?.()}>
        play {track.title}
      </button>
      <button type="button" onClick={onRemove}>
        remove {track.title}
      </button>
      <button type="button" onClick={() => onNudge(1)}>
        lower {track.title}
      </button>
    </li>
  ),
}));

import { usePlaylistOrder } from "../../../hooks/usePlaylistOrder";
import { WorkshopTracks } from "../WorkshopTracks";
import type { SaveOrder, WorkshopLock, WorkshopTrack } from "../types";

const save: SaveOrder = (trackIds, settled) => void saveOrder({ playlistId: "pl-1", trackIds }).then(settled);

function track(requestId: string): WorkshopTrack {
  return {
    externalId: `ext-${requestId}`,
    title: `Title ${requestId}`,
    artist: "Artist",
    artistExternalId: null,
    durationMs: 60_000,
    trackNumber: 1,
    plays: null,
    hasPreview: false,
    album: null,
    inLibrary: true,
    requestId,
    slskd_request_id: null,
    status: "complete",
    failureReason: null,
  };
}

const STORED = [track("a"), track("b")];

function Harness({ lock, stored }: { lock: WorkshopLock; stored: typeof STORED }) {
  const order = usePlaylistOrder(stored, save);
  return <WorkshopTracks playlistId="pl-1" order={order} lock={lock} onArtistNavigate={vi.fn()} />;
}

function tracks(lock: WorkshopLock = null, stored: typeof STORED = STORED) {
  return renderWithProviders(<Harness lock={lock} stored={stored} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  orderSaves.length = 0;
});

describe("WorkshopTracks lock", () => {
  it.each([
    {
      lock: "synced",
      text: "This playlist is kept in sync, so its tracks cannot be edited here. Turn off sync to edit them.",
    },
    { lock: "rule", text: "This playlist is filled by its rule, so its tracks cannot be edited here." },
  ] as const)("says as a warning why a $lock playlist cannot be edited, in place of select all", ({ lock, text }) => {
    tracks(lock);

    const notice = screen.getByRole("note");
    expect(notice).toHaveTextContent(text);
    expect(notice.querySelector("svg.lucide-triangle-alert")).not.toBeNull();
    expect(screen.queryByRole("checkbox", { name: "Select all" })).not.toBeInTheDocument();
  });

  it("shows no warning on a playlist that can be edited", () => {
    tracks();

    expect(screen.queryByRole("note")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select all" })).toBeInTheDocument();
  });

  it("offers no select all on a playlist that can be edited and holds no tracks", () => {
    tracks(null, []);

    expect(screen.queryByRole("checkbox", { name: "Select all" })).not.toBeInTheDocument();
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("still says why a playlist with no tracks cannot be edited when it is locked", () => {
    tracks("synced", []);

    expect(screen.getByRole("note")).toHaveTextContent("This playlist is kept in sync");
  });
});

describe("WorkshopTracks removal", () => {
  it("moves the player on once the track that is playing has been removed", async () => {
    remove.mockResolvedValueOnce(true);
    tracks();

    await userEvent.click(screen.getByRole("button", { name: "remove Title a" }));

    await waitFor(() => expect(next).toHaveBeenCalledTimes(1));
    expect(remove).toHaveBeenCalledWith({
      playlistId: "pl-1",
      removed: [{ trackId: "a", position: 0, title: "Title a" }],
      skipped: true,
    });
  });

  it("leaves the player where it is when the removal is refused", async () => {
    remove.mockResolvedValueOnce(false);
    tracks();

    await userEvent.click(screen.getByRole("button", { name: "remove Title a" }));

    await waitFor(() => expect(remove).toHaveBeenCalledTimes(1));
    expect(next).not.toHaveBeenCalled();
  });

  it("saves a keyboard move that is still waiting before it removes, and removes only once that save has settled", async () => {
    remove.mockResolvedValueOnce(true);
    tracks();

    await userEvent.click(screen.getByRole("button", { name: "lower Title a" }));
    expect(saveOrder).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "remove Title b" }));

    await waitFor(() => expect(saveOrder).toHaveBeenCalledTimes(1));
    expect(saveOrder.mock.calls[0]?.[0]).toEqual({ playlistId: "pl-1", trackIds: ["b", "a"] });
    expect(remove).not.toHaveBeenCalled();

    orderSaves[0]?.();

    await waitFor(() => expect(remove).toHaveBeenCalledTimes(1));
  });

  it("plays from a row only once a keyboard move that is still waiting has been saved", async () => {
    tracks();

    await userEvent.click(screen.getByRole("button", { name: "lower Title a" }));
    await userEvent.click(screen.getByRole("button", { name: "play Title b" }));

    await waitFor(() => expect(saveOrder).toHaveBeenCalledTimes(1));
    expect(playEntityFrom).not.toHaveBeenCalled();

    orderSaves[0]?.();

    await waitFor(() => expect(playEntityFrom).toHaveBeenCalledWith({ kind: "playlist", playlistId: "pl-1" }, "b"));
  });

  it("does not move the player when the removed track is not the one playing", async () => {
    remove.mockResolvedValueOnce(true);
    tracks();

    await userEvent.click(screen.getByRole("button", { name: "remove Title b" }));

    await waitFor(() => expect(remove).toHaveBeenCalledTimes(1));
    expect(next).not.toHaveBeenCalled();
  });
});
