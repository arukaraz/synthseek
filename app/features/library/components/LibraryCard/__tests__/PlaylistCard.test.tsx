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
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("PlaylistCard", () => {
  it("is presentational with no button semantics when onOpen is absent", () => {
    renderWithProviders(<PlaylistCard item={createLibraryPlaylist()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Road Trip")).toBeInTheDocument();
  });

  it("opens the detail flow on click when onOpen is provided", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<PlaylistCard item={createLibraryPlaylist()} onOpen={onOpen} />);

    await user.click(screen.getByRole("button"));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("activates with Enter and Space when interactive", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<PlaylistCard item={createLibraryPlaylist()} onOpen={onOpen} />);

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
