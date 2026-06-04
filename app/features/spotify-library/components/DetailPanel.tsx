"use client";

import { useSpotifyLibraryItemDetail } from "@hooks/api/queries/spotify/useSpotifyLibraryItemDetail";
import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import { detailLoading, detailPane } from "../styles";

import { DetailEmptyState } from "./DetailEmptyState";
import { DetailHero } from "./DetailHero";
import { DetailMetadata } from "./DetailMetadata";
import { DetailSyncConfig } from "./DetailSyncConfig";
import { DetailTracklist } from "./DetailTracklist";
import type { DetailPanelProps } from "./types";

export function DetailPanel({ focusedItem, draft, onBack }: DetailPanelProps) {
  const { t } = useTranslation("library");
  const detail = useSpotifyLibraryItemDetail(focusedItem?.id ?? null, focusedItem?.type ?? null, Boolean(focusedItem));

  if (!focusedItem) {
    return (
      <div className={cn(detailPane(), "hidden md:flex")}>
        <DetailEmptyState />
      </div>
    );
  }

  if (detail.isLoading || !detail.data) {
    return (
      <div className={detailPane()}>
        <div className={detailLoading()}>{t("spotifyLibrary.detail.loading")}</div>
      </div>
    );
  }

  const handleBack = onBack ?? (() => draft.setFocus(null));

  const d = detail.data;
  const byParts: string[] = [];
  if (d.subtitle) byParts.push(d.subtitle);
  byParts.push(t("spotifyLibrary.detail.tracksByline", { count: d.totalTracks }));
  const byline = byParts.join(" · ");

  const importedTarget = draft.selectors.targetImported(focusedItem);
  const syncTarget = draft.selectors.targetSyncEnabled(focusedItem);
  const syncSupported = d.type !== "album";
  const showSyncConfig = syncSupported && importedTarget;

  return (
    <div className={detailPane()}>
      <DetailHero
        itemType={d.type}
        imported={focusedItem.imported}
        importedTarget={importedTarget}
        onToggleImport={() => draft.toggleImport(focusedItem)}
        externalUrl={d.externalUrl}
        name={d.name}
        crumb={d.crumb}
        byline={byline}
        image={d.image}
        onBack={handleBack}
      />
      {showSyncConfig && (
        <DetailSyncConfig itemType={d.type} syncEnabled={syncTarget} onToggle={() => draft.toggleSync(focusedItem)} />
      )}
      <DetailMetadata sourceId={d.sourceId} released={d.released} label={d.label} lastSyncedAt={d.lastSyncedAt} />
      <DetailTracklist
        totalTracks={d.totalTracks}
        preview={d.trackPreview}
        externalUrl={d.externalUrl}
        hasMore={d.hasMore}
      />
    </div>
  );
}
