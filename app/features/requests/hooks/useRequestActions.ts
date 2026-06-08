"use client";

import { ContentType, RequestStatus, type RequestWithTracks } from "@api/__generated__/types";
import {
  useCancelAlbum,
  useCancelPlaylist,
  useDeleteAlbum,
  useDeletePlaylist,
  usePauseAlbum,
  usePausePlaylist,
  usePrioritizeAlbum,
  usePrioritizePlaylist,
  useResumeAlbum,
  useResumePlaylist,
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
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { exportFilename } from "../helpers";

interface UseRequestActions {
  retry: () => void;
  remove: () => Promise<void>;
  cancel: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  prioritize: () => void;
  syncPlex: () => void;
  syncSourceNow: () => void;
  exportJspf: () => Promise<void>;
  canManage: boolean;
  canRetry: boolean;
  canRemove: boolean;
  canCancel: boolean;
  canPause: boolean;
  canResume: boolean;
  isPaused: boolean;
  canPrioritize: boolean;
  canSyncPlex: boolean;
  canSyncSource: boolean;
  canExport: boolean;
  isRetrying: boolean;
  syncPlexPending: boolean;
  syncSourcePending: boolean;
  label: "Album" | "Playlist";
}

export function useRequestActions(request: RequestWithTracks): UseRequestActions {
  const { t } = useTranslation("requests");
  const { currentUser } = useAuthContext();
  const canManage = isOwnerOrAdminFE({ id: request.requestedBy.id }, currentUser);
  const isPlaylist = request.contentType === ContentType.enum.playlist;
  const label: "Album" | "Playlist" = isPlaylist ? "Playlist" : "Album";
  const typeLabel = isPlaylist ? t("labels.playlist") : t("labels.album");

  const retryAlbum = useRetryAlbum();
  const retryPlaylist = useRetryPlaylist();
  const retryPlex = useRetryPlexPlaylist();
  const deleteAlbum = useDeleteAlbum();
  const deletePlaylist = useDeletePlaylist();
  const cancelAlbum = useCancelAlbum();
  const cancelPlaylist = useCancelPlaylist();
  const pauseAlbum = usePauseAlbum();
  const pausePlaylist = usePausePlaylist();
  const resumeAlbum = useResumeAlbum();
  const resumePlaylist = useResumePlaylist();
  const prioritizeAlbum = usePrioritizeAlbum();
  const prioritizePlaylist = usePrioritizePlaylist();
  const syncSpotifyPlaylist = useSpotifySyncPlaylistNow();
  const { exportCollection } = useExportCollection();

  const canRetry =
    canManage &&
    (request.status === RequestStatus.enum.failed ||
      request.status === RequestStatus.enum.cancelled ||
      request.status === RequestStatus.enum.partially_complete);
  const canCancel = canManage && isProcessingStatus(request.status);
  const isPaused = request.status === RequestStatus.enum.paused;
  const canPause = canManage && isProcessingStatus(request.status) && !isPaused;
  const canResume = canManage && isPaused;
  const canPrioritize =
    canManage && request.tracks.some((track) => track.status === RequestStatus.enum.queued && track.priority === 0);
  const canSyncPlex =
    canManage &&
    isPlaylist &&
    (request.status === RequestStatus.enum.complete || request.status === RequestStatus.enum.partially_complete);
  const canSyncSource = canManage && isPlaylist && request.source_provider === "spotify";

  const isRetrying = isPlaylist ? retryPlaylist.isPending : retryAlbum.isPending;

  const retry = () => {
    if (isPlaylist) retryPlaylist.mutate({ playlistId: request.id });
    else retryAlbum.mutate({ albumId: request.id });
  };

  const prioritize = () => {
    if (isPlaylist) prioritizePlaylist.mutate({ playlistId: request.id });
    else prioritizeAlbum.mutate({ albumId: request.id });
  };

  const remove = async () => {
    const confirmed = await confirm({
      title: t("confirm.removeTitle", { label: typeLabel }),
      message: t("confirm.removeMessage", { name: request.name, artist: request.artist }),
      variant: "danger",
      confirmText: t("confirm.removeConfirm", { label: typeLabel }),
      cancelText: t("confirm.removeKeep"),
    });
    if (!confirmed) return;
    if (isPlaylist) deletePlaylist.mutate({ playlistId: request.id });
    else deleteAlbum.mutate({ albumId: request.id });
  };

  const cancel = async () => {
    const confirmed = await confirm({
      title: t("confirm.cancelDownloadsTitle", { label: typeLabel }),
      message: t("confirm.cancelDownloadsMessage", { name: request.name, artist: request.artist }),
      variant: "danger",
      confirmText: t("confirm.cancelDownloadsConfirm"),
      cancelText: t("confirm.cancelDownloadsKeep"),
    });
    if (!confirmed) return;
    if (isPlaylist) cancelPlaylist.mutate({ playlistId: request.id });
    else cancelAlbum.mutate({ albumId: request.id });
  };

  const pause = () => {
    if (isPlaylist) pausePlaylist.mutate({ playlistId: request.id });
    else pauseAlbum.mutate({ albumId: request.id });
  };

  const resume = () => {
    if (isPlaylist) resumePlaylist.mutate({ playlistId: request.id });
    else resumeAlbum.mutate({ albumId: request.id });
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
      toast.error(t("export.failed"));
    }
  };

  return {
    retry,
    remove,
    cancel,
    pause,
    resume,
    prioritize,
    syncPlex,
    syncSourceNow,
    exportJspf,
    canManage,
    canRetry,
    canRemove: canManage,
    canCancel,
    canPause,
    canResume,
    isPaused,
    canPrioritize,
    canSyncPlex,
    canSyncSource,
    canExport: canManage,
    isRetrying,
    syncPlexPending: retryPlex.isPending,
    syncSourcePending: syncSpotifyPlaylist.isPending,
    label,
  };
}
