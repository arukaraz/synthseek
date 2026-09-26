import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";

import { AutoWatchToggles } from "../AutoWatchToggles";

const autoWatch = enLibrary.librarySource.autoWatch;

async function openPopover() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: autoWatch.configureAria }));
  return user;
}

describe("AutoWatchToggles", () => {
  it("offers both watchers to a source that supports both and counts the active ones out of two", async () => {
    render(
      <AutoWatchToggles
        providerName="Spotify"
        watch={{ playlists: true, savedAlbums: true }}
        value={{ playlists: true, savedAlbums: false }}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("1/2")).toBeInTheDocument();
    await openPopover();

    expect(screen.getByRole("switch", { name: autoWatch.newPlaylistsAria })).toBeChecked();
    expect(screen.getByRole("switch", { name: autoWatch.savedAlbumsAria })).not.toBeChecked();
    expect(screen.getByText(autoWatch.savedAlbumsSub.replace("{{provider}}", "Spotify"))).toBeInTheDocument();
  });

  it("offers only the playlist watcher to a playlist-only source and counts out of one", async () => {
    render(
      <AutoWatchToggles
        providerName="Navidrome"
        watch={{ playlists: true, savedAlbums: false }}
        value={{ playlists: true, savedAlbums: true }}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("1/1")).toBeInTheDocument();
    await openPopover();

    expect(screen.getByRole("switch", { name: autoWatch.newPlaylistsAria })).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: autoWatch.savedAlbumsAria })).not.toBeInTheDocument();
  });

  it("reads off when no supported watcher is active", () => {
    render(
      <AutoWatchToggles
        providerName="Navidrome"
        watch={{ playlists: true, savedAlbums: false }}
        value={{ playlists: false, savedAlbums: true }}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText(autoWatch.off)).toBeInTheDocument();
  });

  it("reports a flipped watcher under its own key", async () => {
    const onChange = vi.fn();
    render(
      <AutoWatchToggles
        providerName="Spotify"
        watch={{ playlists: true, savedAlbums: true }}
        value={{ playlists: false, savedAlbums: false }}
        onChange={onChange}
      />
    );
    const user = await openPopover();

    await user.click(screen.getByRole("switch", { name: autoWatch.savedAlbumsAria }));

    expect(onChange).toHaveBeenCalledWith({ savedAlbums: true });
  });

  it("names the source in the explanation", async () => {
    render(
      <AutoWatchToggles
        providerName="Jellyfin"
        watch={{ playlists: true, savedAlbums: false }}
        value={{ playlists: false, savedAlbums: false }}
        onChange={vi.fn()}
      />
    );
    const user = await openPopover();

    await user.click(screen.getByRole("button", { name: autoWatch.howAria }));

    expect(screen.getByText(autoWatch.help.replace("{{provider}}", "Jellyfin"))).toBeInTheDocument();
  });
});
