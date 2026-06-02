"use client";

import { ContentType, RequestStatus, type RequestWithTracks } from "@api/__generated__/types";
import {
  useCancelAlbum,
  useCancelPlaylist,
  useDeleteAlbum,
  useDeletePlaylist,
  useRetryAlbum,
  useRetryPlaylist,
  useRetryPlexPlaylist,
} from "@hooks/api";
import { useSpotifySyncPlaylistNow } from "@hooks/api/mutations/spotify/useSpotifyImport";
import { useExportCollection } from "@hooks/api/queries/portability/useExportCollection";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { isOwnerOrAdminFE } from "@utils/authorization";
import { confirm } from "@utils/confirm";
import { downloadText } from "@utils/download";
import { isProcessingStatus } from "@utils/status-helpers";
import { toast } from "sonner";

import { exportFilename } from "../helpers";

interface UseRequestActions {
  retry: () => void;
  remove: () => Promise<void>;
  cancel: () => Promise<void>;
  syncPlex: () => void;
  syncSourceNow: () => void;
  exportJspf: () => Promise<void>;
  canManage: boolean;
  canRetry: boolean;
  canRemove: boolean;
  canCancel: boolean;
  canSyncPlex: boolean;
  canSyncSource: boolean;
  canExport: boolean;
  syncPlexPending: boolean;
  syncSourcePending: boolean;
  label: "Album" | "Playlist";
}

export function useRequestActions(request: RequestWithTracks): UseRequestActions {
  const { currentUser } = useAuthContext();
  const canManage = isOwnerOrAdminFE({ id: request.requestedBy.id }, currentUser);
  const isPlaylist = request.contentType === ContentType.enum.playlist;
  const label: "Album" | "Playlist" = isPlaylist ? "Playlist" : "Album";

  const retryAlbum = useRetryAlbum();
  const retryPlaylist = useRetryPlaylist();
  const retryPlex = useRetryPlexPlaylist();
  const deleteAlbum = useDeleteAlbum();
  const deletePlaylist = useDeletePlaylist();
  const cancelAlbum = useCancelAlbum();
  const cancelPlaylist = useCancelPlaylist();
  const syncSpotifyPlaylist = useSpotifySyncPlaylistNow();
  const { exportCollection } = useExportCollection();

  const canRetry =
    canManage &&
    (request.status === RequestStatus.enum.failed ||
      request.status === RequestStatus.enum.cancelled ||
      request.status === RequestStatus.enum.partially_complete ||
      request.status === RequestStatus.enum.paused);
  const canCancel = canManage && isProcessingStatus(request.status);
  const canSyncPlex =
    canManage &&
    isPlaylist &&
    request.plex_playlist_id === null &&
    (request.status === RequestStatus.enum.complete || request.status === RequestStatus.enum.partially_complete);
  const canSyncSource = canManage && isPlaylist && request.source_provider === "spotify";

  const retry = () => {
    if (isPlaylist) retryPlaylist.mutate({ playlistId: request.id });
    else retryAlbum.mutate({ albumId: request.id });
  };

  const remove = async () => {
    const confirmed = await confirm({
      title: `Remove ${label} Request`,
      message: `Remove "${request.name}" by ${request.artist}? This action cannot be undone.`,
      variant: "danger",
      confirmText: `Remove ${label}`,
      cancelText: "Keep",
    });
    if (!confirmed) return;
    if (isPlaylist) deletePlaylist.mutate({ playlistId: request.id });
    else deleteAlbum.mutate({ albumId: request.id });
  };

  const cancel = async () => {
    const confirmed = await confirm({
      title: `Cancel ${label} Downloads`,
      message: `Cancel all active downloads for "${request.name}" by ${request.artist}?`,
      variant: "danger",
      confirmText: "Cancel Downloads",
      cancelText: "Keep Downloading",
    });
    if (!confirmed) return;
    if (isPlaylist) cancelPlaylist.mutate({ playlistId: request.id });
    else cancelAlbum.mutate({ albumId: request.id });
  };

  const syncPlex = () => {
    retryPlex.mutate({ playlistId: request.id });
  };

  const syncSourceNow = () => {
    syncSpotifyPlaylist.mutate({ playlistId: request.id });
  };

  const exportJspf = async () => {
    try {
      const doc = await exportCollection({ id: request.id, type: isPlaylist ? "playlist" : "album" });
      downloadText(exportFilename(request.name), JSON.stringify(doc, null, 2));
    } catch {
      toast.error("Export failed");
    }
  };

  return {
    retry,
    remove,
    cancel,
    syncPlex,
    syncSourceNow,
    exportJspf,
    canManage,
    canRetry,
    canRemove: canManage,
    canCancel,
    canSyncPlex,
    canSyncSource,
    canExport: canManage,
    syncPlexPending: retryPlex.isPending,
    syncSourcePending: syncSpotifyPlaylist.isPending,
    label,
  };
}
