"use client";

import { Button } from "@components/ui/Button";
import { IconButton } from "@components/ui/IconButton";
import { StatusBadge } from "@components/ui/StatusBadge";
import { artworkProxySrc } from "@utils/artworkProxy";
import { formatDateTime } from "@utils/formatters";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useRequestActions } from "../../hooks/useRequestActions";
import { formatDelegatedTo } from "./helpers";
import { JspfExportDialog } from "./JspfExportDialog";
import { RequestDetailHeroMenu } from "./RequestDetailHeroMenu";
import {
  heroAvatar,
  heroBackButton,
  heroBanner,
  heroBannerImage,
  heroBannerOverlay,
  heroContent,
  heroControlsCluster,
  heroControlsColumn,
  heroControlsRow,
  heroDesktopStatus,
  heroIdentityBlock,
  heroLastUpdated,
  heroMetaValue,
  heroMobileLastUpdated,
  heroMobileStatus,
  heroMobileTopRow,
  heroMoreButtonDesktop,
  heroMoreButtonMobile,
  heroRetryButton,
  heroTypeRow,
} from "./styles";
import type { RequestDetailHeroProps } from "./types";

export function RequestDetailHero({ request, onBack }: RequestDetailHeroProps) {
  const { t } = useTranslation("requests");
  const actions = useRequestActions(request);
  const {
    retry,
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
    label,
  } = actions;

  const [exportFullOpen, setExportFullOpen] = useState(false);
  const showKebab =
    canRetry ||
    canCancel ||
    canPause ||
    canResume ||
    canPrioritize ||
    canSyncPlex ||
    canSyncSource ||
    canExport ||
    canRemove;
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

      <div className={heroContent()}>
        <div className={heroMobileTopRow()}>
          <IconButton
            icon={ArrowLeft}
            variant="default"
            size="md"
            aria-label={t("detail.backToList")}
            onClick={onBack}
            className={heroBackButton()}
          />
          <p className={heroMobileLastUpdated()}>
            <Trans
              t={t}
              i18nKey="detail.lastUpdated"
              values={{ date: formatDateTime(new Date(request.updated_at)) }}
              components={{ value: <span className={heroMetaValue()} /> }}
            />
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className={heroIdentityBlock()}>
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

            <div className="min-w-0 flex-1">
              <div className={heroTypeRow()}>
                <p className="text-fg/50 text-[10px] font-semibold tracking-wider uppercase">{typeLabel}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={request.status}
                    size="lg"
                    showIcon
                    showLabel={false}
                    className={heroMobileStatus()}
                  />
                  {showKebab && (
                    <RequestDetailHeroMenu
                      actions={actions}
                      typeLabel={typeLabel}
                      onExportFull={() => setExportFullOpen(true)}
                      triggerClassName={heroMoreButtonMobile()}
                    />
                  )}
                </div>
              </div>
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

          <div className={heroControlsColumn()}>
            <p className={heroLastUpdated()}>
              <Trans
                t={t}
                i18nKey="detail.lastUpdated"
                values={{ date: formatDateTime(new Date(request.updated_at)) }}
                components={{ value: <span className={heroMetaValue()} /> }}
              />
            </p>

            <div className={heroControlsRow()}>
              <div className={heroControlsCluster()}>
                <StatusBadge status={request.status} size="md" showIcon className={heroDesktopStatus()} />
                {canRetry && (
                  <Button
                    onClick={retry}
                    variant="outline"
                    size="sm"
                    disabled={isRetrying}
                    className={heroRetryButton()}
                  >
                    {isRetrying ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-1.5 size-3.5" />
                    )}
                    {t("detail.retryFailed")}
                  </Button>
                )}

                {showKebab && (
                  <RequestDetailHeroMenu
                    actions={actions}
                    typeLabel={typeLabel}
                    onExportFull={() => setExportFullOpen(true)}
                    triggerClassName={heroMoreButtonDesktop()}
                  />
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
