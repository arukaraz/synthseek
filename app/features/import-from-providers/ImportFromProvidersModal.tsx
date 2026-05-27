"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { useSpotifyImport, useSpotifyRunSyncNow } from "@hooks/api/mutations/spotify/useSpotifyImport";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";

import { ProviderSidebar } from "./components/ProviderSidebar";
import { ImportFooter } from "./components/ImportFooter";
import { DEFAULT_IMPORT_CONFIG } from "./constants";
import { SpotifyPanel } from "./providers/spotify/SpotifyPanel";
import { useSpotifyImportState } from "./providers/spotify/hooks/useSpotifyImportState";
import { modalLayout, modalRoot } from "./styles";
import type { ImportFromProvidersModalProps, ProviderKey } from "./types";

export function ImportFromProvidersModal({ open, onOpenChange }: ImportFromProvidersModalProps) {
  const [provider, setProvider] = useState<ProviderKey>("spotify");
  const spotifyState = useSpotifyImportState();
  const importMutation = useSpotifyImport();
  const syncAllMutation = useSpotifyRunSyncNow();
  const spotifyStatus = useSpotifyConnectionStatus();
  const canSyncAll = provider === "spotify" && (spotifyStatus.data?.connected ?? false);

  const handleImport = async () => {
    if (provider !== "spotify") return;
    await importMutation.mutateAsync({
      playlistIds: Array.from(spotifyState.selectedPlaylists),
      enableSyncForPlaylistIds: Array.from(spotifyState.syncPlaylists),
      importLikedSongs: spotifyState.importLikedSongs,
      enableSyncLikedSongs: spotifyState.enableSyncLikedSongs,
      savedAlbumIds: Array.from(spotifyState.selectedAlbums),
      config: DEFAULT_IMPORT_CONFIG,
    });
    spotifyState.reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    spotifyState.reset();
    onOpenChange(false);
  };

  const handleSyncAll = () => {
    syncAllMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={modalRoot()}>
        <DialogTitle className="sr-only">Import from external providers</DialogTitle>
        <DialogDescription className="sr-only">
          Select content from your external libraries to import into Synthseek.
        </DialogDescription>
        <div className={modalLayout()}>
          <ProviderSidebar active={provider} onChange={setProvider} />
          {provider === "spotify" && (
            <SpotifyPanel state={spotifyState} onClose={() => onOpenChange(false)} />
          )}
        </div>
        <ImportFooter
          totalSelected={spotifyState.totalSelected}
          onImport={handleImport}
          onCancel={handleCancel}
          onSyncAll={handleSyncAll}
          isPending={importMutation.isPending}
          isSyncAllPending={syncAllMutation.isPending}
          canSyncAll={canSyncAll}
        />
      </DialogContent>
    </Dialog>
  );
}
