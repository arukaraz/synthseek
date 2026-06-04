"use client";

import { Button } from "@components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { IconButton } from "@components/ui/IconButton";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { StatusBadge } from "@components/ui/StatusBadge";
import { cn } from "@utils/cn";
import { getContentTypeIcon } from "@utils/content-type-helpers";
import { formatTimestamp } from "@utils/formatters";
import { ArrowLeft, Download, Globe, MoreVertical, RefreshCcw, RefreshCw, Square, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRequestActions } from "../../hooks/useRequestActions";
import { JspfExportDialog } from "./JspfExportDialog";
import {
  heroAvatar,
  heroAvatarTypeBadge,
  heroBanner,
  heroBannerImage,
  heroBannerOverlay,
  heroContent,
  heroMoreButton,
} from "./styles";
import type { RequestDetailHeroProps } from "./types";

export function RequestDetailHero({ request, onBack }: RequestDetailHeroProps) {
  const { t } = useTranslation("requests");
  const FallbackIcon = getContentTypeIcon(request.contentType);
  const {
    retry,
    remove,
    cancel,
    syncPlex,
    syncSourceNow,
    exportJspf,
    canRetry,
    canRemove,
    canCancel,
    canSyncPlex,
    canSyncSource,
    canExport,
    syncPlexPending,
    syncSourcePending,
    label,
  } = useRequestActions(request);

  const [exportFullOpen, setExportFullOpen] = useState(false);
  const hasMoreActions = canCancel || canSyncPlex || canSyncSource || canExport;
  const typeLabel = label === "Playlist" ? t("labels.playlist") : t("labels.album");

  return (
    <div className="relative">
      <div className={heroBanner()} aria-hidden="true">
        {request.album_art ? (
          <Image src={request.album_art} alt="" fill sizes="100vw" className={heroBannerImage()} priority />
        ) : (
          <div className="from-primary-500/20 to-accent-500/20 absolute inset-0 bg-linear-to-br" />
        )}
        <div className={heroBannerOverlay()} />
      </div>

      <IconButton
        icon={ArrowLeft}
        variant="default"
        size="md"
        aria-label={t("detail.backToList")}
        onClick={onBack}
        className="absolute top-3 left-3 z-10 md:hidden"
      />

      <div className={heroContent()}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-3 sm:gap-4">
            <div className={heroAvatar({ size: "lg" })}>
              {request.album_art ? (
                <>
                  <Image
                    src={request.album_art}
                    alt={request.name}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-cover"
                  />
                  <span className={cn(heroAvatarTypeBadge(), `type-text-${request.contentType}`)}>
                    <FallbackIcon className="size-3.5" aria-hidden />
                  </span>
                </>
              ) : (
                <FallbackIcon className="text-primary-300 size-8" aria-hidden />
              )}
            </div>

            <div className="min-w-0 space-y-0.5">
              <p className="text-fg/50 text-[10px] font-semibold tracking-wider uppercase">
                {label} · {formatTimestamp(new Date(request.created_at))}
              </p>
              <h1 className="text-fg truncate text-xl font-bold drop-shadow-sm sm:text-2xl">{request.name}</h1>
              <p className="text-fg/60 truncate text-sm">{request.artist}</p>
              <p className="text-fg/40 truncate text-xs">
                {t("detail.requestedBy", { username: request.requestedBy.username })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatusBadge status={request.status} size="md" showIcon />

            <div className="flex items-center gap-2">
              {canRetry && (
                <Button
                  onClick={retry}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-primary-500/30 bg-primary-500/10 text-primary-300",
                    "hover:border-primary-500/50 hover:bg-primary-500/20 hover:text-primary-200"
                  )}
                >
                  <RefreshCw className="mr-1.5 size-3.5" />
                  {t("detail.retryFailed")}
                </Button>
              )}

              {canRemove && (
                <IconButton
                  icon={Trash2}
                  variant="red"
                  size="md"
                  aria-label={t("detail.removeAction", { label: typeLabel })}
                  onClick={remove}
                />
              )}

              {hasMoreActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className={heroMoreButton()} aria-label={t("detail.moreActions")}>
                      <MoreVertical className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-44">
                    {canCancel && (
                      <DropdownMenuItem onClick={cancel} className="text-yellow-400 focus:text-yellow-300">
                        <Square className="size-3.5" />
                        {t("detail.cancelDownloads")}
                      </DropdownMenuItem>
                    )}
                    {canSyncSource && (
                      <DropdownMenuItem
                        onClick={syncSourceNow}
                        disabled={syncSourcePending}
                        className="text-emerald-400 focus:text-emerald-300"
                      >
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
                      <DropdownMenuItem onClick={() => setExportFullOpen(true)}>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      <JspfExportDialog request={request} open={exportFullOpen} onOpenChange={setExportFullOpen} />
    </div>
  );
}
