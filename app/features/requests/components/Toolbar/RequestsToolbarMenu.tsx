"use client";

import type { MediaServerKey } from "@api/__generated__/types";
import { SyncToSubmenu } from "@components/SyncToSubmenu";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { Spinner } from "@components/ui/Spinner";
import {
  useDeleteAllRequests,
  useGetPlaylistSyncAllState,
  usePauseAll,
  usePlaylistSyncAllProgress,
  useQueueStatus,
  useResumeAll,
  useRetryAllFailed,
  useSyncAllPlaylistsTo,
} from "@hooks/api";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { playbackServerName } from "@utils/playback-servers";
import { MoreVertical, Pause, Play, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { toolbarMenuContent, toolbarMenuDeleteItem, toolbarMenuTrigger } from "./styles";
import type { RequestsToolbarMenuProps } from "./types";

export function RequestsToolbarMenu({ hasItems }: RequestsToolbarMenuProps) {
  const { t } = useTranslation("requests");
  const { isAdmin } = useAuthContext();
  const retryAllFailed = useRetryAllFailed();
  const syncAll = useSyncAllPlaylistsTo();
  const deleteAll = useDeleteAllRequests();
  const pauseAll = usePauseAll();
  const resumeAll = useResumeAll();
  const { data: queueStatus } = useQueueStatus();
  const { data: syncState } = useGetPlaylistSyncAllState();
  const syncProgress = usePlaylistSyncAllProgress();
  const isQueuePaused = queueStatus?.isPaused ?? false;
  const isSyncing = syncProgress
    ? syncProgress.phase !== "complete"
    : (syncState?.running ?? false) || syncAll.isPending;
  const runningServer = syncProgress?.server ?? syncState?.server ?? null;

  const [confirmRetryOpen, setConfirmRetryOpen] = useState(false);
  const [confirmSyncServer, setConfirmSyncServer] = useState<MediaServerKey | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const confirmServerName = confirmSyncServer === null ? "" : playbackServerName(confirmSyncServer);

  if (!hasItems && !isAdmin) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={toolbarMenuTrigger()} aria-label={t("toolbar.menu.trigger")}>
            <MoreVertical className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={toolbarMenuContent()}>
          {hasItems && (
            <DropdownMenuItem onSelect={() => setConfirmRetryOpen(true)}>
              <RefreshCw className="size-3.5" />
              {t("toolbar.retryAllFailed.label")}
            </DropdownMenuItem>
          )}
          {hasItems &&
            (isSyncing ? (
              <DropdownMenuItem disabled>
                <Spinner size="sm" decorative />
                {t("toolbar.syncAll.labelRunning", {
                  server: runningServer === null ? "" : playbackServerName(runningServer),
                })}
              </DropdownMenuItem>
            ) : (
              <SyncToSubmenu label={t("toolbar.syncAll.label")} onSelect={setConfirmSyncServer} />
            ))}
          {isAdmin &&
            (isQueuePaused ? (
              <DropdownMenuItem onSelect={() => resumeAll.mutate()}>
                <Play className="size-3.5" />
                {t("toolbar.resumeAll")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => pauseAll.mutate()}>
                <Pause className="size-3.5" />
                {t("toolbar.pauseAll")}
              </DropdownMenuItem>
            ))}
          {isAdmin && (
            <DropdownMenuItem onSelect={() => setConfirmDeleteOpen(true)} className={toolbarMenuDeleteItem()}>
              <Trash2 className="size-3.5" />
              {t("toolbar.menu.deleteAll.label")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        isOpen={confirmRetryOpen}
        onClose={() => setConfirmRetryOpen(false)}
        onConfirm={() => retryAllFailed.mutate()}
        title={t("toolbar.retryAllFailed.confirmTitle")}
        message={t("toolbar.retryAllFailed.confirmMessage")}
        variant="warning"
        confirmText={
          retryAllFailed.isPending
            ? t("toolbar.retryAllFailed.confirmPending")
            : t("toolbar.retryAllFailed.confirmAction")
        }
      />

      <ConfirmationModal
        isOpen={confirmSyncServer !== null}
        onClose={() => setConfirmSyncServer(null)}
        onConfirm={() => {
          if (confirmSyncServer !== null && !isSyncing) syncAll.mutate({ server: confirmSyncServer });
        }}
        title={t("toolbar.syncAll.confirmTitle", { server: confirmServerName })}
        message={t("toolbar.syncAll.confirmMessage", { server: confirmServerName })}
        variant="warning"
        confirmText={isSyncing ? t("toolbar.syncAll.confirmPending") : t("toolbar.syncAll.confirmAction")}
      />

      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => deleteAll.mutate()}
        title={t("toolbar.menu.deleteAll.confirmTitle")}
        message={t("toolbar.menu.deleteAll.confirmMessage")}
        variant="danger"
        confirmText={
          deleteAll.isPending ? t("toolbar.menu.deleteAll.confirmPending") : t("toolbar.menu.deleteAll.confirmAction")
        }
        cancelText={t("toolbar.menu.deleteAll.cancel")}
      />
    </>
  );
}
