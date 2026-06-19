import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enComponents from "@modules/i18n/messages/en/components.json";
import enLibrary from "@modules/i18n/messages/en/library.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { AddToPlaylistDropdown } from "../AddToPlaylistDropdown";
import type { LibraryPlaylistItem } from "@hooks/api/queries/library/types";

const addMutation = createMockMutation();
const createMutation = createMockMutation();
const playlistsQuery = { items: [] as LibraryPlaylistItem[], isLoading: false };

vi.mock("@hooks/api/queries/library/useLibraryPlaylists", () => ({
  useLibraryPlaylists: () => playlistsQuery,
}));

vi.mock("@hooks/api/mutations/playlists/useAddTracksToPlaylist", () => ({
  useAddTracksToPlaylist: () => addMutation,
}));

vi.mock("@hooks/api/mutations/playlists/useCreatePlaylist", () => ({
  useCreatePlaylist: () => createMutation,
}));

function makePlaylist(overrides: Partial<LibraryPlaylistItem> = {}): LibraryPlaylistItem {
  return {
    id: "pl-local",
    external_id: "local:1",
    name: "My Mix",
    owner: "me",
    image: null,
    images: [],
    status: "complete",
    total_tracks: 3,
    completed_tracks: 3,
    source_provider: null,
    sync_enabled: false,
    created_at: new Date(),
    ...overrides,
  };
}

const dropdown = enLibrary.playlists.dropdown;

beforeAll(() => {
  i18n.addResourceBundle("en", "library", enLibrary, true, true);
  i18n.addResourceBundle("en", "components", enComponents, true, true);
});

beforeEach(() => {
  addMutation.mutate.mockReset();
  createMutation.mutate.mockReset();
  playlistsQuery.items = [];
  playlistsQuery.isLoading = false;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderDropdown(trackIds: string[] = ["t1", "t2"]) {
  const onDone = vi.fn();
  render(
    <AddToPlaylistDropdown
      trackIds={trackIds}
      onDone={onDone}
      trigger={<button type="button">{dropdown.addToPlaylist}</button>}
    />
  );
  return { onDone };
}

async function open() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: dropdown.addToPlaylist }));
  return user;
}

describe("AddToPlaylistDropdown", () => {
  it("lists local and imported-sync-off playlists but excludes imported-syncing ones", async () => {
    playlistsQuery.items = [
      makePlaylist({ id: "pl-local", name: "Local Mix", source_provider: null, sync_enabled: false }),
      makePlaylist({ id: "pl-imported-off", name: "Imported Off", source_provider: "spotify", sync_enabled: false }),
      makePlaylist({ id: "pl-imported-on", name: "Imported Syncing", source_provider: "spotify", sync_enabled: true }),
    ];
    renderDropdown();
    await open();

    expect(screen.getByText("Local Mix")).toBeInTheDocument();
    expect(screen.getByText("Imported Off")).toBeInTheDocument();
    expect(screen.queryByText("Imported Syncing")).not.toBeInTheDocument();
  });

  it("shows the empty state when no editable playlists exist", async () => {
    playlistsQuery.items = [makePlaylist({ source_provider: "spotify", sync_enabled: true })];
    renderDropdown();
    await open();

    expect(screen.getByText(dropdown.empty)).toBeInTheDocument();
  });

  it("adds the selected tracks to a playlist", async () => {
    playlistsQuery.items = [makePlaylist({ id: "pl-local", name: "Local Mix" })];
    const { onDone } = renderDropdown(["t1", "t2"]);
    const user = await open();

    await user.click(screen.getByRole("button", { name: /Local Mix/ }));

    expect(addMutation.mutate).toHaveBeenCalledTimes(1);
    expect(addMutation.mutate).toHaveBeenCalledWith(
      { playlistId: "pl-local", trackIds: ["t1", "t2"] },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onDone).not.toHaveBeenCalled();
  });

  it("creates a new playlist with the typed name and selected tracks", async () => {
    renderDropdown(["t1", "t2"]);
    const user = await open();

    await user.type(screen.getByPlaceholderText(dropdown.newPlaceholder), "Fresh Mix");
    await user.click(screen.getByRole("button", { name: dropdown.create }));

    expect(createMutation.mutate).toHaveBeenCalledTimes(1);
    expect(createMutation.mutate).toHaveBeenCalledWith(
      { name: "Fresh Mix", trackIds: ["t1", "t2"] },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("guards an empty playlist name", async () => {
    renderDropdown();
    const user = await open();

    const createButton = screen.getByRole("button", { name: dropdown.create });
    expect(createButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText(dropdown.newPlaceholder), "   ");
    expect(createButton).toBeDisabled();
    expect(createMutation.mutate).not.toHaveBeenCalled();
  });
});
