"use client";

import { Button } from "@components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { IconButton } from "@components/ui/IconButton";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { StatusBadge } from "@components/ui/StatusBadge";
import { cn } from "@utils/cn";
import { artworkProxySrc } from "@utils/artworkProxy";
import { formatDateTime } from "@utils/formatters";
import {
  ArrowLeft,
  ChevronsUp,
  Download,
  Globe,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  RefreshCcw,
  RefreshCw,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useRequestActions } from "../../hooks/useRequestActions";
import { formatDelegatedTo } from "./helpers";
import { JspfExportDialog } from "./JspfExportDialog";
import {
  heroAvatar,
  heroBanner,
  heroBannerImage,
  heroBannerOverlay,
  heroContent,
  heroMetaValue,
  heroMoreButton,
} from "./styles";
import type { RequestDetailHeroProps } from "./types";

export function RequestDetailHero({ request, onBack }: RequestDetailHeroProps) {
  const { t } = useTranslation("requests");
  const {
    retry,
    remove,
    cancel,
    pause,
    resume,
    prioritize,
    syncPlex,
    syncSourceNow,
    exportJspf,
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
    label,
  } = useRequestActions(request);

  const [exportFullOpen, setExportFullOpen] = useState(false);
  const hasMoreActions =
    canCancel || canPause || canResume || canPrioritize || canSyncPlex || canSyncSource || canExport;
  const typeLabel = label === "Playlist" ? t("labels.playlist") : t("labels.album");
  const delegatedTo = formatDelegatedTo(request.delegated_to);

  return (
    <div className="relative">
      <div className={heroBanner()} aria-hidden="true">
        {request.album_art ? (
          <Image
            src={artworkProxySrc(request.album_art)}
            alt=""
            fill
            sizes="100vw"
            className={heroBannerImage()}
            priority
          />
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
            {request.album_art && (
              <div className={heroAvatar({ size: "lg" })}>
                <Image
                  src={artworkProxySrc(request.album_art)}
                  alt={request.name}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-fg/50 text-[10px] font-semibold tracking-wider uppercase">{label}</p>
              <h1 className="text-fg truncate text-xl font-bold drop-shadow-sm sm:text-2xl">{request.name}</h1>
              <p className="text-fg/60 truncate text-sm">{request.artist}</p>
              <div className="mt-2 space-y-0.5">
                <p className="text-fg/40 truncate text-xs">
                  <Trans
                    t={t}
                    i18nKey="detail.requestedBy"
                    values={{
                      username: request.requestedBy.username,
                      date: formatDateTime(new Date(request.requested_at)),
                    }}
                    components={{ value: <span className={heroMetaValue()} /> }}
                  />
                </p>
                {delegatedTo && (
                  <p className="text-fg/40 truncate text-xs">
                    <Trans
                      t={t}
                      i18nKey="detail.delegatedTo"
                      values={{ name: delegatedTo }}
                      components={{ value: <span className={heroMetaValue()} /> }}
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <p className="text-fg/40 text-right text-xs">
              <Trans
                t={t}
                i18nKey="detail.lastUpdated"
                values={{ date: formatDateTime(new Date(request.updated_at)) }}
                components={{ value: <span className={heroMetaValue()} /> }}
              />
            </p>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <StatusBadge status={request.status} size="md" showIcon />

              <div className="flex items-center gap-2">
                {canRetry && (
                  <Button
                    onClick={retry}
                    variant="outline"
                    size="sm"
                    disabled={isRetrying}
                    className={cn(
                      "border-primary-500/30 bg-primary-500/10 text-primary-300",
                      "hover:border-primary-500/50 hover:bg-primary-500/20 hover:text-primary-200"
                    )}
                  >
                    {isRetrying ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-1.5 size-3.5" />
                    )}
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
                      {canResume ? (
                        <DropdownMenuItem onClick={resume} className="text-primary-400 focus:text-primary-300">
                          <Play className="size-3.5" />
                          {t("detail.resume")}
                        </DropdownMenuItem>
                      ) : (
                        canPause && (
                          <DropdownMenuItem onClick={pause} className="text-yellow-400 focus:text-yellow-300">
                            <Pause className="size-3.5" />
                            {t("detail.pause")}
                          </DropdownMenuItem>
                        )
                      )}
                      {canCancel && (
                        <DropdownMenuItem onClick={cancel} className="text-yellow-400 focus:text-yellow-300">
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
      </div>

      <JspfExportDialog request={request} open={exportFullOpen} onOpenChange={setExportFullOpen} />
    </div>
  );
}
