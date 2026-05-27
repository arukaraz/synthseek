"use client";

import { useState } from "react";

import { useSettings } from "@hooks/api/queries/useSettings";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { SPOTIFY_TABS } from "../../constants";
import { content, tabButton, tabsRow } from "../../styles";
import type { SpotifyTab } from "../../types";

import { ConnectGate } from "./components/ConnectGate";
import { LikedSongsTab } from "./components/LikedSongsTab";
import { PlaylistsTab } from "./components/PlaylistsTab";
import { SavedAlbumsTab } from "./components/SavedAlbumsTab";
import { TopReadOnlyTab } from "./components/TopReadOnlyTab";
import { WatchLibraryPanel } from "./components/WatchLibraryPanel";
import type { SpotifyPanelProps } from "./types";

export function SpotifyPanel({ state, onClose }: SpotifyPanelProps) {
  const [tab, setTab] = useState<SpotifyTab>("playlists");
  const settings = useSettings();
  const status = useSpotifyConnectionStatus();
  const { isAdmin } = useAuthContext();

  const configured = Boolean(settings.data?.connections.spotify.clientId && settings.data?.connections.spotify.publicBaseUrl);
  const connected = status.data?.connected ?? false;
  const pending = status.data?.pending ?? false;

  if (!configured || !connected) {
    return (
      <div className={content()}>
        <ConnectGate configured={configured} isAdmin={isAdmin} pending={pending} onClose={onClose} />
      </div>
    );
  }

  return (
    <div className={content()}>
      <div className={tabsRow()}>
        {SPOTIFY_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={tabButton({ active: tab === t.key })}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "playlists" && (
        <PlaylistsTab
          selected={state.selectedPlaylists}
          sync={state.syncPlaylists}
          onToggle={state.togglePlaylist}
          onToggleSync={state.togglePlaylistSync}
        />
      )}
      {tab === "liked" && (
        <LikedSongsTab
          imported={state.importLikedSongs}
          enableSync={state.enableSyncLikedSongs}
          onToggleImport={state.setImportLikedSongs}
          onToggleSync={state.setEnableSyncLikedSongs}
        />
      )}
      {tab === "albums" && <SavedAlbumsTab selected={state.selectedAlbums} onToggle={state.toggleAlbum} />}
      {tab === "top" && <TopReadOnlyTab />}
      <WatchLibraryPanel />
    </div>
  );
}
