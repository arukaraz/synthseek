"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import {
  Check,
  ChevronsUp,
  Download,
  Globe,
  MoreVertical,
  Pause,
  Play,
  RefreshCcw,
  RefreshCw,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { heroDeleteMenuItem, heroRetryMenuItem, heroSuccessMenuItem, heroWarningMenuItem } from "./styles";
import type { RequestDetailHeroMenuProps } from "./types";

export function RequestDetailHeroMenu({
  actions,
  typeLabel,
  onExportFull,
  onRejectPending,
  triggerClassName,
}: RequestDetailHeroMenuProps) {
  const { t } = useTranslation("requests");
  const {
    retry,
    remove,
    cancel,
    pause,
    resume,
    prioritize,
    approve,
    syncPlex,
    syncSourceNow,
    exportJspf,
    canApprove,
    isApproving,
    pendingApprovalCount,
    canRetry,
    canRemove,
    canCancel,
    canPause,
    canResume,
    canPrioritize,
    canSyncPlex,
    canSyncSource,
    canExport,
    isRetrying,
    syncPlexPending,
    syncSourcePending,
  } = actions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={triggerClassName} aria-label={t("detail.moreActions")}>
          <MoreVertical className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {canApprove && (
          <DropdownMenuItem onClick={approve} disabled={isApproving} className={heroSuccessMenuItem()}>
            <Check className="size-3.5" />
            {t("approval.approvePending", { count: pendingApprovalCount })}
          </DropdownMenuItem>
        )}
        {canApprove && (
          <DropdownMenuItem onClick={onRejectPending} disabled={isApproving} className={heroWarningMenuItem()}>
            <X className="size-3.5" />
            {t("approval.rejectPending", { count: pendingApprovalCount })}
          </DropdownMenuItem>
        )}
        {canRetry && (
          <DropdownMenuItem onClick={retry} disabled={isRetrying} className={heroRetryMenuItem()}>
            <RefreshCw className="size-3.5" />
            {t("detail.retryFailed")}
          </DropdownMenuItem>
        )}
        {canResume ? (
          <DropdownMenuItem onClick={resume} className="text-primary-400 focus:text-primary-300">
            <Play className="size-3.5" />
            {t("detail.resume")}
          </DropdownMenuItem>
        ) : (
          canPause && (
            <DropdownMenuItem onClick={pause} className={heroWarningMenuItem()}>
              <Pause className="size-3.5" />
              {t("detail.pause")}
            </DropdownMenuItem>
          )
        )}
        {canCancel && (
          <DropdownMenuItem onClick={cancel} className={heroWarningMenuItem()}>
            <Square className="size-3.5" />
            {t("detail.cancelDownloads")}
          </DropdownMenuItem>
        )}
        {canPrioritize && (
          <DropdownMenuItem onClick={prioritize} className="text-primary-400 focus:text-primary-300">
            <ChevronsUp className="size-3.5" />
            {t("detail.jumpTheQueue")}
          </DropdownMenuItem>
        )}
        {canSyncSource && (
          <DropdownMenuItem onClick={syncSourceNow} disabled={syncSourcePending} className={heroSuccessMenuItem()}>
            <RefreshCcw className="size-3.5" />
            {syncSourcePending ? t("detail.syncing") : t("detail.syncFromSource")}
          </DropdownMenuItem>
        )}
        {canSyncPlex && (
          <DropdownMenuItem
            onClick={syncPlex}
            disabled={syncPlexPending}
            className="text-primary-400 focus:text-primary-300"
          >
            <Upload className="size-3.5" />
            {syncPlexPending ? t("detail.syncing") : t("detail.syncToPlex")}
          </DropdownMenuItem>
        )}
        {canExport && (
          <DropdownMenuItem onClick={() => void exportJspf()}>
            <Download className="size-3.5" />
            <span className="flex-1">{t("detail.export")}</span>
            <InfoTooltip
              trigger="click"
              side="left"
              title={t("detail.exportTooltipTitle")}
              description={t("detail.exportTooltipDescription")}
              points={[
                t("detail.exportTooltipPointIds"),
                t("detail.exportTooltipPointMusicBrainz"),
                t("detail.exportTooltipPointRefind"),
              ]}
            />
          </DropdownMenuItem>
        )}
        {canExport && (
          <DropdownMenuItem onClick={onExportFull}>
            <Globe className="size-3.5" />
            <span className="flex-1">{t("detail.exportMax")}</span>
            <InfoTooltip
              trigger="click"
              side="left"
              title={t("detail.exportMaxTooltipTitle")}
              description={t("detail.exportMaxTooltipDescription")}
              points={[
                t("detail.exportMaxTooltipPointSlower"),
                t("detail.exportMaxTooltipPointBest"),
                t("detail.exportMaxTooltipPointMatches"),
              ]}
            />
          </DropdownMenuItem>
        )}
        {canRemove && (
          <DropdownMenuItem onClick={() => void remove()} className={heroDeleteMenuItem()}>
            <Trash2 className="size-3.5" />
            {t("detail.removeAction", { label: typeLabel })}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
