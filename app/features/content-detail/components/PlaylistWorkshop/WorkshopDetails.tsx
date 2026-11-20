"use client";

import { DeletePlaylistDialog } from "@components/DeletePlaylistDialog";
import { useRenamePlaylist } from "@hooks/api/mutations/playlists/useRenamePlaylist";
import { useSetPlaylistSync } from "@hooks/api/mutations/playlists/useSetPlaylistSync";
import { useSetPlaylistVisibility } from "@hooks/api/mutations/playlists/useSetPlaylistVisibility";
import { playlistOriginLabel } from "@utils/playlist";
import { Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { PlaylistSyncToggle } from "../DetailHero";
import { VISIBILITY_OPTIONS } from "./constants";
import {
  actionList,
  actionRow,
  actionRowLabel,
  detailsBody,
  factTerm,
  factValue,
  facts,
  field,
  fieldLabel,
  nameInput,
  visibilityGrid,
  visibilityHint,
  visibilityOption,
  visibilityTitle,
} from "./styles";
import { WorkshopCover } from "./WorkshopCover";
import { WorkshopField } from "./WorkshopField";
import { WorkshopFiles } from "./WorkshopFiles";
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
  cover,
  hasCustomCover,
  canEditTracks,
  limits,
  trackCount,
  minutes,
  inLibrary,
  onDeleted,
}: WorkshopDetailsProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tLibrary } = useTranslation("library");
  const nameId = useId();
  const lockedHint = tLibrary("playlists.syncedReadonly");
  const keepInSyncLabel = tLibrary("playlists.keepInSync");
  const renamePlaylist = useRenamePlaylist();
  const setVisibility = useSetPlaylistVisibility();
  const setSync = useSetPlaylistSync();
  const [draft, setDraft] = useState(name);
  const [seenName, setSeenName] = useState(name);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (seenName !== name) {
    setSeenName(name);
    setDraft(name);
  }

  const saveName = () => {
    const next = draft.trim();
    if (next.length === 0 || next === name) {
      setDraft(name);
      return;
    }
    renamePlaylist.mutate({ playlistId, name: next });
  };

  return (
    <div className={detailsBody()}>
      <section className={field()}>
        <label htmlFor={nameId} className={fieldLabel()}>
          {t("workshop.details.name")}
        </label>
        <input
          id={nameId}
          type="text"
          className={nameInput()}
          value={draft}
          maxLength={limits.nameChars}
          disabled={!canRename}
          title={canRename ? undefined : lockedHint}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={saveName}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              event.stopPropagation();
              setDraft(name);
            }
          }}
        />
      </section>

      <WorkshopField label={t("workshop.details.cover")}>
        <WorkshopCover
          playlistId={playlistId}
          name={name}
          cover={cover}
          hasCustomCover={hasCustomCover}
          maxBytes={limits.coverBytes}
          accept={limits.coverTypes}
        />
      </WorkshopField>

      <WorkshopField label={t("workshop.details.visibility")}>
        <div className={visibilityGrid()}>
          {VISIBILITY_OPTIONS.map((option) => (
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
        <WorkshopFiles playlistId={playlistId} name={name} canImport={canEditTracks} maxChars={limits.fileChars} />
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
