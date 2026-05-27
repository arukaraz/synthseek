"use client";

import { useState } from "react";

import { toggleSet } from "../../../helpers";

export function useSpotifyImportState() {
  const [selectedPlaylists, setSelectedPlaylists] = useState<ReadonlySet<string>>(new Set());
  const [syncPlaylists, setSyncPlaylists] = useState<ReadonlySet<string>>(new Set());
  const [importLikedSongs, setImportLikedSongs] = useState(false);
  const [enableSyncLikedSongs, setEnableSyncLikedSongs] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState<ReadonlySet<string>>(new Set());

  const togglePlaylist = (id: string) => setSelectedPlaylists((prev) => toggleSet(prev, id));
  const togglePlaylistSync = (id: string) => setSyncPlaylists((prev) => toggleSet(prev, id));
  const toggleAlbum = (id: string) => setSelectedAlbums((prev) => toggleSet(prev, id));

  const reset = () => {
    setSelectedPlaylists(new Set());
    setSyncPlaylists(new Set());
    setImportLikedSongs(false);
    setEnableSyncLikedSongs(false);
    setSelectedAlbums(new Set());
  };

  const totalSelected =
    selectedPlaylists.size + selectedAlbums.size + (importLikedSongs ? 1 : 0);

  return {
    selectedPlaylists,
    syncPlaylists,
    selectedAlbums,
    importLikedSongs,
    enableSyncLikedSongs,
    togglePlaylist,
    togglePlaylistSync,
    toggleAlbum,
    setImportLikedSongs,
    setEnableSyncLikedSongs,
    totalSelected,
    reset,
  };
}

export type SpotifyImportState = ReturnType<typeof useSpotifyImportState>;
