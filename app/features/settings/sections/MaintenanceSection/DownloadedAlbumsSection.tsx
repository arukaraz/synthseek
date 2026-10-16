"use client";

import { Disc3, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { EmptyState } from "@components/ui/EmptyState";
import { IconButton } from "@components/ui/IconButton";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { Spinner } from "@components/ui/Spinner";
import { useClearStagedReleases, useRemoveStagedRelease } from "@hooks/api/mutations/settings/useStagedReleases";
import { useStagedReleases } from "@hooks/api/queries/useStagedReleases";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { formatBytes, formatRelativeTime, formatTimeUntil } from "@utils/formatters";

import { DOWNLOADED_ALBUM_FILTERS } from "./constants";
import { downloadedAlbumsIn, requestLinkFor, totalBytesOf } from "./helpers";
import { MaintenancePage } from "./MaintenancePage";
import {
  downloadedAlbumBody,
  downloadedAlbumList,
  downloadedAlbumMeta,
  downloadedAlbumName,
  downloadedAlbumRelease,
  downloadedAlbumRow,
  downloadedAlbumsHeader,
  downloadedAlbumSource,
} from "./styles";
import type { DownloadedAlbumFilter } from "./types";

export function DownloadedAlbumsSection() {
  const { t } = useTranslation("settings");
  const sourceLabel = useDownloadSourceLabel();
  const entries = useStagedReleases(true);
  const removeEntry = useRemoveStagedRelease();
  const clearAll = useClearStagedReleases();
  const [filter, setFilter] = useState<DownloadedAlbumFilter>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const all = entries.data ?? [];
  const shown = downloadedAlbumsIn(all, filter);
  const busy = removeEntry.isPending || clearAll.isPending;
  const tabs = DOWNLOADED_ALBUM_FILTERS.map((value) => ({
    value,
    label: value === "all" ? t("maintenance.downloadedAlbums.filterAll") : sourceLabel(value),
    count: downloadedAlbumsIn(all, value).length,
  }));

  return (
    <MaintenancePage surface="downloadedAlbums" descriptionAsTooltip>
      <div className={downloadedAlbumsHeader()}>
        <SegmentTabs
          items={tabs}
          value={filter}
          onValueChange={setFilter}
          layoutId="downloaded-albums-filter"
          ariaLabel={t("maintenance.downloadedAlbums.filterLabel")}
        />
        {shown.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} disabled={busy}>
            {clearAll.isPending ? <Spinner size="sm" /> : <Trash2 className="size-4" />}
            {t("maintenance.downloadedAlbums.clearAll")}
          </Button>
        ) : null}
      </div>

      {entries.isLoading ? (
        <span className="text-fg/60 text-sm">{t("maintenance.downloadedAlbums.loading")}</span>
      ) : entries.isError ? (
        <span className="text-destructive-vivid text-sm">{t("maintenance.downloadedAlbums.loadError")}</span>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={Disc3}
          title={t("maintenance.downloadedAlbums.emptyTitle")}
          description={t("maintenance.downloadedAlbums.emptyDescription")}
        />
      ) : (
        <>
          <ul className={downloadedAlbumList()}>
            {shown.map((entry) => (
              <li key={entry.id} className={downloadedAlbumRow()}>
                <div className={downloadedAlbumBody()}>
                  {entry.album !== null ? (
                    <Link href={requestLinkFor(entry.album.externalId)} className={downloadedAlbumName()}>
                      {entry.album.name}
                    </Link>
                  ) : null}
                  <span className={downloadedAlbumRelease()} title={entry.releaseTitle}>
                    {entry.releaseTitle}
                  </span>
                  <div className={downloadedAlbumMeta()}>
                    <span className={downloadedAlbumSource()}>{sourceLabel(entry.source)}</span>
                    <span>{formatBytes(entry.sizeBytes)}</span>
                    <span>
                      {t("maintenance.downloadedAlbums.lastUsed", { when: formatRelativeTime(entry.lastUsedAt) })}
                    </span>
                    <span>
                      {t("maintenance.downloadedAlbums.expiresIn", { when: formatTimeUntil(entry.expiresAt) })}
                    </span>
                  </div>
                </div>
                <IconButton
                  icon={X}
                  size="sm"
                  aria-label={t("maintenance.downloadedAlbums.remove", { title: entry.releaseTitle })}
                  onClick={() => removeEntry.mutate({ id: entry.id })}
                  disabled={busy}
                />
              </li>
            ))}
          </ul>
          <span className="text-fg/60 text-xs">
            {t("maintenance.downloadedAlbums.total", { size: formatBytes(totalBytesOf(shown)) })}
          </span>
        </>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => clearAll.mutate({ source: filter === "all" ? null : filter })}
        title={t("maintenance.downloadedAlbums.confirmClear.title")}
        message={t("maintenance.downloadedAlbums.confirmClear.message")}
        confirmText={t("maintenance.downloadedAlbums.confirmClear.confirm")}
        variant="danger"
      />
    </MaintenancePage>
  );
}
