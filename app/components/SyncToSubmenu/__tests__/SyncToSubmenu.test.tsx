import { render, screen, userEvent } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@components/ui/DropdownMenu";

import { SyncToSubmenu } from "../SyncToSubmenu";
import type { SyncToSubmenuProps } from "../types";

interface TargetsState {
  data: Array<{ server: string; name: string }> | undefined;
}

const targets = vi.hoisted(() => {
  const state: TargetsState = {
    data: [
      { server: "plex", name: "Plex" },
      { server: "navidrome", name: "Navidrome" },
      { server: "jellyfin", name: "Jellyfin" },
    ],
  };
  return state;
});

const viewport = vi.hoisted(() => ({ narrow: false }));

vi.mock("@hooks/api", () => ({
  usePlaylistSyncTargets: () => ({ data: targets.data }),
}));

vi.mock("@hooks/ui/useMediaQuery", () => ({
  useMediaQuery: () => viewport.narrow,
}));

function renderInMenu(props: Partial<SyncToSubmenuProps> = {}) {
  const onSelect = vi.fn();
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <SyncToSubmenu label="Sync to..." onSelect={onSelect} {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
  return onSelect;
}

async function openSubmenu() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Open" }));
  screen.getByRole("menuitem", { name: "Sync to..." }).focus();
  await user.keyboard("{ArrowRight}");
  return user;
}

describe("SyncToSubmenu", () => {
  beforeEach(() => {
    viewport.narrow = false;
    targets.data = [
      { server: "plex", name: "Plex" },
      { server: "navidrome", name: "Navidrome" },
      { server: "jellyfin", name: "Jellyfin" },
    ];
  });

  it("lists every server that takes playlists and hands back the one picked", async () => {
    const onSelect = renderInMenu();
    const user = await openSubmenu();

    expect(await screen.findByRole("menuitem", { name: "Plex" })).toHaveFocus();
    expect(screen.getByRole("menuitem", { name: "Navidrome" })).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledWith("jellyfin");
  });

  it("leaves out the server it was told to exclude", async () => {
    renderInMenu({ excludeServer: "navidrome" });
    await openSubmenu();

    expect(await screen.findByRole("menuitem", { name: "Plex" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Navidrome" })).not.toBeInTheDocument();
  });

  it("renders nothing when no server is left to sync to", async () => {
    targets.data = [{ server: "plex", name: "Plex" }];
    renderInMenu({ excludeServer: "plex" });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.queryByRole("menuitem", { name: "Sync to..." })).not.toBeInTheDocument();
  });

  it("lists the servers inline on a narrow screen, where a side panel would run off the edge", async () => {
    viewport.narrow = true;
    const onSelect = renderInMenu({ label: "Sync all playlists to..." });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByText("Sync all playlists to...")).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Sync all playlists to..." })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Navidrome" }));

    expect(onSelect).toHaveBeenCalledWith("navidrome");
  });

  it("renders nothing before the servers are known", async () => {
    targets.data = undefined;
    renderInMenu();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.queryByRole("menuitem", { name: "Sync to..." })).not.toBeInTheDocument();
  });
});
