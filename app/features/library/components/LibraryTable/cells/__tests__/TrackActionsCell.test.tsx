import { beforeEach, describe, expect, it, vi } from "vitest";

import type { QueuePresence } from "@components/ui/QueueAddButton";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { renderWithProviders, screen } from "@test/test-utils";

const auth = vi.hoisted(() => ({ isAdmin: false }));
const queue = vi.hoisted(() => ({ presence: "absent" as QueuePresence, remove: vi.fn() }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: auth.isAdmin, currentUser: null, isLoading: false }),
}));

vi.mock("@hooks/ui/player", () => ({
  useQueuePresence: () => () => queue.presence,
  playerActions: { removeTrackFromQueue: queue.remove },
}));

import { TrackActionsCell } from "../TrackActionsCell";

function track(overrides?: Partial<LibraryTrackItem>): LibraryTrackItem {
  return {
    id: "trk-1",
    external_id: "ext-1",
    title: "Aerodynamic",
    artist: "Daft Punk",
    status: "complete",
    source: "local",
    format: "flac",
    request_type: "track",
    bitrate: 1411,
    file_bitrate: null,
    file_format: null,
    playable: true,
    sources: [],
    duration_ms: 212000,
    track_number: 3,
    disc_number: 1,
    explicit: false,
    album_id: "alb-1",
    albumName: "Discovery",
    albumArt: null,
    genres: [],
    playlistIds: [],
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    libraryPath: { id: "music", label: "Music" },
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    completed_at: null,
    ...overrides,
  };
}

const onEnqueue = vi.fn(async () => true);
const onSearchBetterQuality = vi.fn();
const fileActions = { canMove: true, openMove: vi.fn(), openDelete: vi.fn() };

function renderCell(item: LibraryTrackItem = track()) {
  return renderWithProviders(
    <TrackActionsCell
      item={item}
      onEnqueue={onEnqueue}
      onSearchBetterQuality={onSearchBetterQuality}
      fileActions={fileActions}
    />
  );
}

async function openMenu(user: ReturnType<typeof renderCell>["user"]) {
  await user.click(screen.getByRole("button", { name: /More actions for Aerodynamic/i }));
}

describe("TrackActionsCell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.isAdmin = false;
    queue.presence = "absent";
  });

  it("gives a member the quality and queue items, and nothing that touches files", async () => {
    const { user } = renderCell();
    await openMenu(user);

    expect(screen.getByRole("menuitem", { name: /Search better quality/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Add to queue/i })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Move to path/i })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: /Delete file/i })).toBeNull();
  });

  it("adds move and delete for an admin", async () => {
    auth.isAdmin = true;
    const { user } = renderCell();
    await openMenu(user);

    expect(screen.getByRole("menuitem", { name: /Search better quality/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Add to queue/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Move to path/i })).not.toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitem", { name: /Delete file/i })).not.toHaveAttribute("aria-disabled", "true");
  });

  it("leaves move out for an admin whose library has a single path, keeping delete", async () => {
    auth.isAdmin = true;
    const { user } = renderWithProviders(
      <TrackActionsCell
        item={track()}
        onEnqueue={onEnqueue}
        onSearchBetterQuality={onSearchBetterQuality}
        fileActions={{ ...fileActions, canMove: false }}
      />
    );
    await openMenu(user);

    expect(screen.queryByRole("menuitem", { name: /Move to path/i })).toBeNull();
    expect(screen.getByRole("menuitem", { name: /Delete file/i })).toBeInTheDocument();
  });

  it("opens the move for this one track", async () => {
    auth.isAdmin = true;
    const { user } = renderCell();
    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /Move to path/i }));

    expect(fileActions.openMove).toHaveBeenCalledWith({
      scope: "track",
      trackId: "trk-1",
      title: "Aerodynamic",
      pathIds: ["music"],
    });
  });

  it("asks for the delete confirmation for this one track", async () => {
    auth.isAdmin = true;
    const { user } = renderCell();
    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /Delete file/i }));

    expect(fileActions.openDelete).toHaveBeenCalledWith({
      scope: "track",
      trackId: "trk-1",
      title: "Aerodynamic",
      pathIds: ["music"],
    });
  });

  it("disables move and delete for a track with no file in the library", async () => {
    auth.isAdmin = true;
    const { user } = renderCell(track({ libraryPath: null }));
    await openMenu(user);

    expect(screen.getByRole("menuitem", { name: /Move to path/i })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitem", { name: /Delete file/i })).toHaveAttribute("aria-disabled", "true");
  });

  it("queues the track while it is not in the queue", async () => {
    const { user } = renderCell();
    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /Add to queue/i }));

    expect(onEnqueue).toHaveBeenCalledWith(["trk-1"]);
    expect(queue.remove).not.toHaveBeenCalled();
  });

  it("flips to remove from the queue once the track is up next, and removes it", async () => {
    queue.presence = "upcoming";
    const { user } = renderCell();
    await openMenu(user);

    expect(screen.queryByRole("menuitem", { name: /Add to queue/i })).toBeNull();
    await user.click(screen.getByRole("menuitem", { name: /Remove from queue/i }));

    expect(queue.remove).toHaveBeenCalledWith("trk-1");
    expect(onEnqueue).not.toHaveBeenCalled();
  });

  it("flips the label back when the track leaves the queue", async () => {
    queue.presence = "upcoming";
    const view = renderCell();
    await openMenu(view.user);
    expect(screen.getByRole("menuitem", { name: /Remove from queue/i })).toBeInTheDocument();

    await view.user.keyboard("{Escape}");
    queue.presence = "absent";
    view.rerender(
      <TrackActionsCell
        item={track()}
        onEnqueue={onEnqueue}
        onSearchBetterQuality={onSearchBetterQuality}
        fileActions={fileActions}
      />
    );
    await openMenu(view.user);

    expect(screen.getByRole("menuitem", { name: /Add to queue/i })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Remove from queue/i })).toBeNull();
  });

  it("offers no queue item for the track that is playing, or one that cannot play", async () => {
    queue.presence = "playing";
    const playing = renderCell();
    await openMenu(playing.user);
    expect(screen.queryByRole("menuitem", { name: /queue/i })).toBeNull();
    playing.unmount();

    queue.presence = "absent";
    const unplayable = renderCell(track({ playable: false }));
    await openMenu(unplayable.user);
    expect(screen.queryByRole("menuitem", { name: /queue/i })).toBeNull();
  });

  it("searches better quality for a finished track and disables it for one still in flight", async () => {
    const done = renderCell();
    await openMenu(done.user);
    await done.user.click(screen.getByRole("menuitem", { name: /Search better quality/i }));
    expect(onSearchBetterQuality).toHaveBeenCalledWith(["trk-1"]);
    done.unmount();

    const inFlight = renderCell(track({ status: "downloading" }));
    await openMenu(inFlight.user);
    expect(screen.getByRole("menuitem", { name: /Search better quality/i })).toHaveAttribute("aria-disabled", "true");
  });
});
