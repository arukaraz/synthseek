import { render, screen, userEvent } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { RequestDetailHeroMenu } from "../RequestDetailHeroMenu";
import type { RequestDetailHeroMenuProps } from "../types";

type Actions = RequestDetailHeroMenuProps["actions"];

function makeActions(overrides: Partial<Actions> = {}): Actions {
  return {
    retry: vi.fn(),
    remove: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    resume: vi.fn(),
    prioritize: vi.fn(),
    syncPlex: vi.fn(),
    syncSourceNow: vi.fn(),
    exportJspf: vi.fn().mockResolvedValue(undefined),
    canManage: true,
    canRetry: false,
    canRemove: false,
    canCancel: false,
    canPause: false,
    canResume: false,
    isPaused: false,
    canPrioritize: false,
    canSyncPlex: false,
    canSyncSource: false,
    canExport: false,
    isRetrying: false,
    syncPlexPending: false,
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

    expect(screen.getByRole("menuitem", { name: "Retry Failed" })).toBeInTheDocument();
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
    await user.click(screen.getByRole("menuitem", { name: "Retry Failed" }));

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
    renderMenu({ canSyncSource: true, syncSourcePending: true });

    await user.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menuitem", { name: "Syncing..." })).toBeInTheDocument();
  });

  it("triggers the source sync when permitted and idle", async () => {
    const syncSourceNow = vi.fn();
    const user = userEvent.setup();
    renderMenu({ canSyncSource: true, syncSourceNow });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Sync from Spotify" }));

    expect(syncSourceNow).toHaveBeenCalledOnce();
  });

  it("triggers the Plex sync from the menu", async () => {
    const syncPlex = vi.fn();
    const user = userEvent.setup();
    renderMenu({ canSyncPlex: true, syncPlex });

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Sync to Plex" }));

    expect(syncPlex).toHaveBeenCalledOnce();
  });

  it("shows the syncing label while a Plex sync is pending", async () => {
    const user = userEvent.setup();
    renderMenu({ canSyncPlex: true, syncPlexPending: true });

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
