import { describe, it, expect, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryPlaylistItem } from "@hooks/api/queries/library/types";

import { PlaylistCard } from "../PlaylistCard";

function createLibraryPlaylist(overrides?: Partial<LibraryPlaylistItem>): LibraryPlaylistItem {
  return {
    id: "pl-1",
    external_id: "ext-1",
    name: "Road Trip",
    owner: "nexus",
    image: null,
    images: [],
    status: "complete",
    total_tracks: 20,
    completed_tracks: 18,
    source_provider: null,
    sync_enabled: false,
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function getCard(): HTMLElement {
  return screen.getByRole("button", { name: /Open details for Road Trip/i });
}

describe("PlaylistCard", () => {
  it("is presentational with no open-card semantics when onOpen is absent", () => {
    renderWithProviders(<PlaylistCard item={createLibraryPlaylist()} />);

    expect(screen.queryByRole("button", { name: /Open details for Road Trip/i })).not.toBeInTheDocument();
    expect(screen.getByText("Road Trip")).toBeInTheDocument();
  });

  it("opens the detail flow on click when onOpen is provided", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<PlaylistCard item={createLibraryPlaylist()} onOpen={onOpen} />);

    await user.click(getCard());

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("activates with Enter and Space when interactive", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<PlaylistCard item={createLibraryPlaylist()} onOpen={onOpen} />);

    const card = getCard();
    card.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it("renders an enabled rename and delete for a local playlist", async () => {
    const { user } = renderWithProviders(<PlaylistCard item={createLibraryPlaylist()} />);

    await user.click(screen.getByRole("button", { name: /Playlist actions for Road Trip/i }));

    expect(screen.getByRole("menuitem", { name: /Rename/i })).not.toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitem", { name: /Delete/i })).not.toHaveAttribute("aria-disabled", "true");
  });

  it("disables rename for an imported syncing playlist but keeps delete enabled", async () => {
    const { user } = renderWithProviders(
      <PlaylistCard item={createLibraryPlaylist({ source_provider: "spotify", sync_enabled: true })} />
    );

    await user.click(screen.getByRole("button", { name: /Playlist actions for Road Trip/i }));

    expect(screen.getByRole("menuitem", { name: /Rename/i })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitem", { name: /Delete/i })).not.toHaveAttribute("aria-disabled", "true");
  });

  it("enables rename for an imported playlist with sync disabled", async () => {
    const { user } = renderWithProviders(
      <PlaylistCard item={createLibraryPlaylist({ source_provider: "spotify", sync_enabled: false })} />
    );

    await user.click(screen.getByRole("button", { name: /Playlist actions for Road Trip/i }));

    expect(screen.getByRole("menuitem", { name: /Rename/i })).not.toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitem", { name: /Delete/i })).not.toHaveAttribute("aria-disabled", "true");
  });
});
