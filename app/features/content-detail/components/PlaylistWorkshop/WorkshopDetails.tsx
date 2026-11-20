"use client";

import { DeletePlaylistDialog } from "@components/DeletePlaylistDialog";
import { useSetPlaylistSync } from "@hooks/api/mutations/playlists/useSetPlaylistSync";
import { useSetPlaylistVisibility } from "@hooks/api/mutations/playlists/useSetPlaylistVisibility";
import { playlistOriginLabel } from "@utils/playlist";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PLAYLIST_VISIBILITY_OPTIONS } from "../../constants";
import { PlaylistSyncToggle } from "../DetailHero";
import {
  actionList,
  actionRow,
  actionRowLabel,
  detailsBody,
  factTerm,
  factValue,
  facts,
  visibilityGrid,
  visibilityHint,
  visibilityOption,
  visibilityTitle,
} from "./styles";
import { WorkshopCover } from "./WorkshopCover";
import { WorkshopField } from "./WorkshopField";
import { WorkshopFiles } from "./WorkshopFiles";
import { WorkshopName } from "./WorkshopName";
import { WorkshopSyncRow } from "./WorkshopSyncRow";
import type { WorkshopDetailsProps } from "./types";

export function WorkshopDetails({
  playlistId,
  name,
  origin,
  visibility,
  sourceProvider,
  syncEnabled,
  canRename,
  nameDraft,
  cover,
  hasCustomCover,
  canEditTracks,
  limits,
  trackCount,
  minutes,
  inLibrary,
  settleEdits,
  onDeleted,
}: WorkshopDetailsProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tLibrary } = useTranslation("library");
  const keepInSyncLabel = tLibrary("playlists.keepInSync");
  const setVisibility = useSetPlaylistVisibility();
  const setSync = useSetPlaylistSync();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className={detailsBody()}>
      <WorkshopCover
        playlistId={playlistId}
        name={name}
        cover={cover}
        hasCustomCover={hasCustomCover}
        maxBytes={limits.coverBytes}
        accept={limits.coverTypes}
      />

      <WorkshopName canRename={canRename} nameDraft={nameDraft} maxChars={limits.nameChars} />

      <WorkshopField label={t("workshop.details.visibility")}>
        <div className={visibilityGrid()}>
          {PLAYLIST_VISIBILITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={visibilityOption({ active: visibility === option })}
              aria-pressed={visibility === option}
              disabled={setVisibility.isPending}
              onClick={() => {
                if (visibility !== option) setVisibility.mutate({ playlistId, visibility: option });
              }}
            >
              <span className={visibilityTitle()}>{t(`workshop.details.${option}`)}</span>
              <span className={visibilityHint()}>{t(`workshop.details.${option}Hint`)}</span>
            </button>
          ))}
        </div>
      </WorkshopField>

      <WorkshopField label={t("workshop.details.about")}>
        <dl className={facts()}>
          <dt className={factTerm()}>{t("workshop.details.origin")}</dt>
          <dd className={factValue()}>{playlistOriginLabel(origin, tLibrary, { withProvider: true })}</dd>
          <dt className={factTerm()}>{t("stats.tracks")}</dt>
          <dd className={factValue()}>{trackCount}</dd>
          <dt className={factTerm()}>{t("workshop.details.inLibrary")}</dt>
          <dd className={factValue()}>{t("workshop.details.inLibraryValue", { inLibrary, total: trackCount })}</dd>
          <dt className={factTerm()}>{t("workshop.details.length")}</dt>
          <dd className={factValue()}>{t("workshop.minutes", { count: minutes })}</dd>
          {sourceProvider === null ? null : (
            <>
              <dt className={factTerm()}>{keepInSyncLabel}</dt>
              <dd className={factValue()}>
                <PlaylistSyncToggle
                  syncEnabled={syncEnabled}
                  onToggle={(enabled) => setSync.mutate({ playlistId, enabled })}
                  disabled={setSync.isPending}
                />
              </dd>
            </>
          )}
        </dl>
      </WorkshopField>

      <WorkshopField label={t("workshop.details.files")}>
        <WorkshopFiles
          playlistId={playlistId}
          name={name}
          canImport={canEditTracks}
          maxChars={limits.fileChars}
          settleEdits={settleEdits}
        />
      </WorkshopField>

      <WorkshopField label={t("workshop.details.more")}>
        <div className={actionList()}>
          <WorkshopSyncRow playlistId={playlistId} excludeServer={sourceProvider} />
          <button type="button" className={actionRow({ tone: "danger" })} onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4 shrink-0" aria-hidden />
            <span className={actionRowLabel()}>{t("workshop.details.delete")}</span>
          </button>
        </div>
      </WorkshopField>

      <DeletePlaylistDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        playlistId={playlistId}
        onDeleted={onDeleted}
      />
    </div>
  );
}
