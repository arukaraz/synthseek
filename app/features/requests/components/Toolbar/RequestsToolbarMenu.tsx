"use client";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { Spinner } from "@components/ui/Spinner";
import {
  useDeleteAllRequests,
  useGetPlexSyncAllState,
  usePauseAll,
  usePlexSyncAllProgress,
  useQueueStatus,
  useResumeAll,
  useRetryAllFailed,
  useSyncAllPlaylistsToPlex,
} from "@hooks/api";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { MoreVertical, Pause, Play, RefreshCw, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { toolbarMenuContent, toolbarMenuDeleteItem, toolbarMenuTrigger } from "./styles";
import type { RequestsToolbarMenuProps } from "./types";

export function RequestsToolbarMenu({ hasItems }: RequestsToolbarMenuProps) {
  const { t } = useTranslation("requests");
  const { isAdmin } = useAuthContext();
  const retryAllFailed = useRetryAllFailed();
  const syncAllPlex = useSyncAllPlaylistsToPlex();
  const deleteAll = useDeleteAllRequests();
  const pauseAll = usePauseAll();
  const resumeAll = useResumeAll();
  const { data: queueStatus } = useQueueStatus();
  const { data: plexSyncState } = useGetPlexSyncAllState();
  const plexSyncProgress = usePlexSyncAllProgress();
  const isQueuePaused = queueStatus?.isPaused ?? false;
  const isSyncingPlex = plexSyncProgress
    ? plexSyncProgress.phase !== "complete"
    : (plexSyncState?.running ?? false) || syncAllPlex.isPending;

  const [confirmRetryOpen, setConfirmRetryOpen] = useState(false);
  const [confirmSyncPlexOpen, setConfirmSyncPlexOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
          {hasItems && (
            <DropdownMenuItem disabled={isSyncingPlex} onSelect={() => setConfirmSyncPlexOpen(true)}>
              {isSyncingPlex ? <Spinner size="sm" decorative /> : <Upload className="size-3.5" />}
              {isSyncingPlex ? t("toolbar.syncAllPlex.labelRunning") : t("toolbar.syncAllPlex.label")}
            </DropdownMenuItem>
          )}
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
        isOpen={confirmSyncPlexOpen}
        onClose={() => setConfirmSyncPlexOpen(false)}
        onConfirm={() => {
          if (!isSyncingPlex) syncAllPlex.mutate();
        }}
        title={t("toolbar.syncAllPlex.confirmTitle")}
        message={t("toolbar.syncAllPlex.confirmMessage")}
        variant="warning"
        confirmText={isSyncingPlex ? t("toolbar.syncAllPlex.confirmPending") : t("toolbar.syncAllPlex.confirmAction")}
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
