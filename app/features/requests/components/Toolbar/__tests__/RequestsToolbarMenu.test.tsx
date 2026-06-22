import { render, screen, userEvent } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RequestsToolbarMenu } from "../RequestsToolbarMenu";

const retryAllFailed = vi.fn();
const syncAllPlex = vi.fn();
const deleteAll = vi.fn();
const pauseAll = vi.fn();
const resumeAll = vi.fn();

const hookState = {
  isAdmin: false,
  isQueuePaused: false,
  isPlexRunning: false,
};

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: hookState.isAdmin }),
}));

vi.mock("@hooks/api", () => ({
  useRetryAllFailed: () => ({ mutate: retryAllFailed, isPending: false }),
  useSyncAllPlaylistsToPlex: () => ({ mutate: syncAllPlex, isPending: false }),
  useDeleteAllRequests: () => ({ mutate: deleteAll, isPending: false }),
  usePauseAll: () => ({ mutate: pauseAll }),
  useResumeAll: () => ({ mutate: resumeAll }),
  useQueueStatus: () => ({ data: { isPaused: hookState.isQueuePaused } }),
  useGetPlexSyncAllState: () => ({ data: { running: hookState.isPlexRunning } }),
  usePlexSyncAllProgress: () => null,
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
    hookState.isPlexRunning = false;
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
    expect(screen.getByRole("menuitem", { name: "Sync all playlists to Plex" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Delete all requests" })).not.toBeInTheDocument();
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

  it("disables the Plex sync action while a sync is running", async () => {
    hookState.isPlexRunning = true;
    render(<RequestsToolbarMenu hasItems />);
    await openMenu();

    expect(screen.getByRole("menuitem", { name: "Syncing all playlists to Plex..." })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("confirms before syncing all playlists to Plex", async () => {
    render(<RequestsToolbarMenu hasItems />);
    const user = await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Sync all playlists to Plex" }));

    await user.click(await screen.findByRole("button", { name: "Sync All" }));

    expect(syncAllPlex).toHaveBeenCalledOnce();
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
