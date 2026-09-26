import { render, screen, userEvent } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RequestsToolbarMenu } from "../RequestsToolbarMenu";

const retryAllFailed = vi.fn();
const syncAll = vi.fn();
const deleteAll = vi.fn();
const pauseAll = vi.fn();
const resumeAll = vi.fn();

interface HookState {
  isAdmin: boolean;
  isQueuePaused: boolean;
  isSyncRunning: boolean;
  runningServer: string | null;
  targets: Array<{ server: string; name: string }>;
}

const hookState: HookState = {
  isAdmin: false,
  isQueuePaused: false,
  isSyncRunning: false,
  runningServer: null,
  targets: [
    { server: "plex", name: "Plex" },
    { server: "navidrome", name: "Navidrome" },
  ],
};

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: hookState.isAdmin }),
}));

vi.mock("@hooks/api", () => ({
  useRetryAllFailed: () => ({ mutate: retryAllFailed, isPending: false }),
  useSyncAllPlaylistsTo: () => ({ mutate: syncAll, isPending: false }),
  useDeleteAllRequests: () => ({ mutate: deleteAll, isPending: false }),
  usePauseAll: () => ({ mutate: pauseAll }),
  useResumeAll: () => ({ mutate: resumeAll }),
  useQueueStatus: () => ({ data: { isPaused: hookState.isQueuePaused } }),
  useGetPlaylistSyncAllState: () => ({
    data: { running: hookState.isSyncRunning, server: hookState.runningServer, synced: 0, total: 0 },
  }),
  usePlaylistSyncAllProgress: () => null,
  usePlaylistSyncTargets: () => ({ data: hookState.targets }),
}));

async function openMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "More actions" }));
  return user;
}

describe("RequestsToolbarMenu", () => {
  beforeEach(() => {
    hookState.isAdmin = false;
    hookState.isQueuePaused = false;
    hookState.isSyncRunning = false;
    hookState.runningServer = null;
    hookState.targets = [
      { server: "plex", name: "Plex" },
      { server: "navidrome", name: "Navidrome" },
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when there are no items and the user is not an admin", () => {
    const { container } = render(<RequestsToolbarMenu hasItems={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the item-scoped actions but no admin actions for a non-admin with items", async () => {
    render(<RequestsToolbarMenu hasItems />);
    await openMenu();

    expect(screen.getByRole("menuitem", { name: "Retry all failed" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Sync all playlists to..." })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Delete all requests" })).not.toBeInTheDocument();
  });

  it("offers no sync entry when no server takes playlists", async () => {
    hookState.targets = [];
    render(<RequestsToolbarMenu hasItems />);
    await openMenu();

    expect(screen.queryByRole("menuitem", { name: "Sync all playlists to..." })).not.toBeInTheDocument();
  });

  it("shows the delete and pause actions for an admin", async () => {
    hookState.isAdmin = true;
    render(<RequestsToolbarMenu hasItems />);
    await openMenu();

    expect(screen.getByRole("menuitem", { name: "Delete all requests" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Pause all downloads" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Resume all downloads" })).not.toBeInTheDocument();
  });

  it("shows the resume action instead of pause when the queue is paused", async () => {
    hookState.isAdmin = true;
    hookState.isQueuePaused = true;
    render(<RequestsToolbarMenu hasItems />);
    await openMenu();

    expect(screen.getByRole("menuitem", { name: "Resume all downloads" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Pause all downloads" })).not.toBeInTheDocument();
  });

  it("triggers pause and resume directly from the menu", async () => {
    hookState.isAdmin = true;
    const { rerender } = render(<RequestsToolbarMenu hasItems />);
    const user = await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Pause all downloads" }));
    expect(pauseAll).toHaveBeenCalledOnce();

    hookState.isQueuePaused = true;
    rerender(<RequestsToolbarMenu hasItems />);
    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Resume all downloads" }));
    expect(resumeAll).toHaveBeenCalledOnce();
  });

  it("confirms before retrying all failed downloads", async () => {
    render(<RequestsToolbarMenu hasItems />);
    const user = await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Retry all failed" }));

    await user.click(await screen.findByRole("button", { name: "Retry All" }));

    expect(retryAllFailed).toHaveBeenCalledOnce();
  });

  it("shows the running sync, naming its server, in place of the sync entry", async () => {
    hookState.isSyncRunning = true;
    hookState.runningServer = "navidrome";
    render(<RequestsToolbarMenu hasItems />);
    await openMenu();

    expect(screen.getByRole("menuitem", { name: "Syncing all playlists to Navidrome..." })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.queryByRole("menuitem", { name: "Sync all playlists to..." })).not.toBeInTheDocument();
  });

  it("confirms before syncing all playlists to the server picked in the submenu", async () => {
    render(<RequestsToolbarMenu hasItems />);
    const user = await openMenu();
    screen.getByRole("menuitem", { name: "Sync all playlists to..." }).focus();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "Plex" })).toHaveFocus();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(await screen.findByText("Sync All Playlists to Navidrome")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sync All" }));

    expect(syncAll).toHaveBeenCalledWith({ server: "navidrome" });
  });

  it("confirms before deleting all requests as an admin", async () => {
    hookState.isAdmin = true;
    render(<RequestsToolbarMenu hasItems />);
    const user = await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Delete all requests" }));

    await user.click(await screen.findByRole("button", { name: "Delete All" }));

    expect(deleteAll).toHaveBeenCalledOnce();
  });
});
