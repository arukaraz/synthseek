import { render, screen, userEvent } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { RequestDetailHeroMenu } from "../RequestDetailHeroMenu";
import type { RequestDetailHeroMenuProps } from "../types";

vi.mock("@hooks/api", () => ({
  usePlaylistSyncTargets: () => ({
    data: [
      { server: "plex", name: "Plex" },
      { server: "jellyfin", name: "Jellyfin" },
    ],
  }),
}));

type Actions = RequestDetailHeroMenuProps["actions"];

function makeActions(overrides: Partial<Actions> = {}): Actions {
  return {
    retry: vi.fn(),
    remove: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    resume: vi.fn(),
    prioritize: vi.fn(),
    syncTo: vi.fn(),
    syncSourceNow: vi.fn(),
    exportJspf: vi.fn().mockResolvedValue(undefined),
    canManage: true,
    canRetry: false,
    retryableTrackCount: 2,
    canRequestMissing: false,
    missingTrackCount: 0,
    canRemove: false,
    canCancel: false,
    canPause: false,
    canResume: false,
    isPaused: false,
    canPrioritize: false,
    canSyncTo: false,
    syncExcludeServer: null,
    syncSourceName: null,
    canExport: false,
    isRetrying: false,
    syncToPending: false,
    syncSourcePending: false,
    label: "Playlist",
    ...overrides,
  };
}

function renderMenu(overrides: Partial<Actions> = {}) {
  return render(
    <RequestDetailHeroMenu
      actions={makeActions(overrides)}
      typeLabel="Playlist"
      onExportFull={vi.fn()}
      triggerClassName="trigger"
    />
  );
}

describe("RequestDetailHeroMenu", () => {
  it("shows only the permitted actions in the menu", async () => {
    const user = userEvent.setup();
    renderMenu({ canRetry: true, canRemove: true });

    await user.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menuitem", { name: "Retry 2 failed" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Remove Playlist" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Cancel downloads" })).not.toBeInTheDocument();
  });

  it("shows resume instead of pause when paused, and triggers resume", async () => {
    const resume = vi.fn();
    const user = userEvent.setup();
    renderMenu({ canResume: true, canPause: true, resume });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    expect(screen.queryByRole("menuitem", { name: "Pause" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Resume" }));

    expect(resume).toHaveBeenCalledOnce();
  });

  it("calls retry when the retry action is selected", async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    renderMenu({ canRetry: true, retry });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Retry 2 failed" }));

    expect(retry).toHaveBeenCalledOnce();
  });

  it("calls onExportFull when the max-compatibility export is selected", async () => {
    const onExportFull = vi.fn();
    const user = userEvent.setup();
    render(
      <RequestDetailHeroMenu
        actions={makeActions({ canExport: true })}
        typeLabel="Playlist"
        onExportFull={onExportFull}
        triggerClassName="trigger"
      />
    );

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: /Export \(max compatibility\)/ }));

    expect(onExportFull).toHaveBeenCalledOnce();
  });

  it("shows the syncing label while a source sync is pending", async () => {
    const user = userEvent.setup();
    renderMenu({ syncSourceName: "Spotify", syncSourcePending: true });

    await user.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menuitem", { name: "Syncing..." })).toBeInTheDocument();
  });

  it("triggers the source sync, naming the source, when permitted and idle", async () => {
    const syncSourceNow = vi.fn();
    const user = userEvent.setup();
    renderMenu({ syncSourceName: "Navidrome", syncSourceNow });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Sync from Navidrome" }));

    expect(syncSourceNow).toHaveBeenCalledOnce();
  });

  it("offers no source sync when the playlist has no library source", async () => {
    const user = userEvent.setup();
    renderMenu({ syncSourceName: null, canExport: true });

    await user.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.queryByRole("menuitem", { name: /^Sync from/ })).not.toBeInTheDocument();
  });

  it("syncs to the server picked in the Sync to submenu", async () => {
    const syncTo = vi.fn();
    const user = userEvent.setup();
    renderMenu({ canSyncTo: true, syncTo });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    screen.getByRole("menuitem", { name: "Sync to..." }).focus();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "Plex" })).toHaveFocus();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(syncTo).toHaveBeenCalledWith("jellyfin");
  });

  it("leaves the server the playlist came from out of the submenu", async () => {
    const user = userEvent.setup();
    renderMenu({ canSyncTo: true, syncExcludeServer: "jellyfin" });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    screen.getByRole("menuitem", { name: "Sync to..." }).focus();
    await user.keyboard("{ArrowRight}");

    expect(await screen.findByRole("menuitem", { name: "Plex" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Jellyfin" })).not.toBeInTheDocument();
  });

  it("shows the syncing label while a sync is pending", async () => {
    const user = userEvent.setup();
    renderMenu({ canSyncTo: true, syncToPending: true });

    await user.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menuitem", { name: "Syncing..." })).toBeInTheDocument();
  });

  it("triggers cancel downloads from the menu", async () => {
    const cancel = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderMenu({ canCancel: true, cancel });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Cancel downloads" }));

    expect(cancel).toHaveBeenCalledOnce();
  });

  it("triggers prioritize from the jump-the-queue action", async () => {
    const prioritize = vi.fn();
    const user = userEvent.setup();
    renderMenu({ canPrioritize: true, prioritize });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Jump the queue" }));

    expect(prioritize).toHaveBeenCalledOnce();
  });

  it("triggers pause when active and not paused", async () => {
    const pause = vi.fn();
    const user = userEvent.setup();
    renderMenu({ canPause: true, pause });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Pause" }));

    expect(pause).toHaveBeenCalledOnce();
  });

  it("triggers the now-saved export from the menu", async () => {
    const exportJspf = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderMenu({ canExport: true, exportJspf });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: /^Export(?! \(max)/ }));

    expect(exportJspf).toHaveBeenCalledOnce();
  });

  it("triggers remove from the menu", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderMenu({ canRemove: true, remove });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Remove Playlist" }));

    expect(remove).toHaveBeenCalledOnce();
  });
});
