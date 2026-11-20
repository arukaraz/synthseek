"use client";

import { BulkActionBar, type ProminentBulkAction } from "@components/ui/BulkActionBar";
import { Checkbox } from "@components/ui/Checkbox";
import { useRetryTracks } from "@hooks/api";
import { useRemovePlaylistTracksWithUndo } from "@hooks/api/mutations/playlists/useRemovePlaylistTracksWithUndo";
import { playerActions, usePlayerResumableHere, useQueuePresence } from "@hooks/ui/player";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useSelection } from "@hooks/ui/useSelection";
import { motion, Reorder } from "framer-motion";
import { ArrowDownToLine, ArrowUpToLine, ListPlus, ListStart, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { isRemovableTrack, playableTrackId } from "../../helpers";
import { gathered, nudged, removalsOf } from "./helpers";
import {
  tracksBulk,
  tracksEmpty,
  tracksHead,
  tracksHint,
  tracksList,
  tracksNotice,
  tracksSelectAll,
  workshopScroll,
} from "./styles";
import { WorkshopTrackRow } from "./WorkshopTrackRow";
import type { WorkshopTracksProps } from "./types";

export function WorkshopTracks({ playlistId, order, lock, onArtistNavigate }: WorkshopTracksProps) {
  const editable = lock === null;
  const { t } = useTranslation("contentDetail");
  const { t: tLibrary } = useTranslation("library");
  const { remove, isPending: removing } = useRemovePlaylistTracksWithUndo();
  const retryTracks = useRetryTracks();
  const { playEntityFrom, enqueueEntity, playNextEntity } = useEntityPlayback();
  const presenceOf = useQueuePresence();
  const resumableHere = usePlayerResumableHere();
  const selection = useSelection<{ id: string }>();
  const retryingId = retryTracks.isPending ? retryTracks.variables?.trackIds[0] : undefined;

  const { ordered, commit: commitOrder } = order;
  const orderedIds = useMemo(() => ordered.map((track) => track.requestId), [ordered]);
  const selectedIds = useMemo(() => orderedIds.filter((id) => selection.isSelected(id)), [orderedIds, selection]);
  const allSelected = orderedIds.length > 0 && selectedIds.length === orderedIds.length;

  const removeTracks = useCallback(
    async (ids: readonly string[]) => {
      const picked = new Set(ids);
      const removed = removalsOf(ordered, picked);
      if (removed.length === 0) return;
      await commitOrder();
      const skipped = removed.some((track) => {
        const presence = presenceOf(track.trackId);
        return presence === "playing" || presence === "paused";
      });
      const done = await remove({ playlistId, removed, skipped });
      if (!done) return;
      if (skipped) playerActions.next();
      selection.setMany([...picked], false);
    },
    [ordered, commitOrder, presenceOf, remove, playlistId, selection]
  );

  const playableSelection = useCallback(
    () =>
      ordered
        .filter((track) => selection.isSelected(track.requestId))
        .map(playableTrackId)
        .filter((id) => id !== null),
    [ordered, selection]
  );

  const bulkActions: ProminentBulkAction[] = [
    {
      icon: ArrowUpToLine,
      label: t("workshop.tracks.moveTop"),
      onClick: () => order.place(gathered(orderedIds, new Set(selectedIds), "top")),
    },
    {
      icon: ArrowDownToLine,
      label: t("workshop.tracks.moveBottom"),
      onClick: () => order.place(gathered(orderedIds, new Set(selectedIds), "bottom")),
    },
    {
      icon: ListStart,
      label: t("playNext"),
      onClick: () => void playNextEntity({ kind: "tracks", trackIds: playableSelection() }),
    },
    {
      icon: ListPlus,
      label: t("addToQueue"),
      onClick: () => void enqueueEntity({ kind: "tracks", trackIds: playableSelection() }),
    },
    {
      icon: Trash2,
      label: tLibrary("playlists.bulk.remove"),
      onClick: () => void removeTracks(selectedIds),
      disabled: removing || !ordered.some((track) => selection.isSelected(track.requestId) && isRemovableTrack(track)),
      tone: "danger",
    },
  ];

  const rows = ordered.map((track, position) => {
    const playableId = playableTrackId(track);
    return (
      <WorkshopTrackRow
        key={track.requestId}
        track={track}
        position={position}
        presence={playableId === null ? "absent" : presenceOf(playableId)}
        editable={editable}
        selected={selection.isSelected(track.requestId)}
        onSelect={(extend) => {
          if (extend) selection.extendTo(orderedIds, track.requestId);
          else selection.toggle(track.requestId);
        }}
        onPlay={
          playableId === null
            ? undefined
            : async () => {
                await commitOrder();
                return playEntityFrom({ kind: "playlist", playlistId }, playableId);
              }
        }
        onTogglePlay={playableId === null || !resumableHere ? undefined : playerActions.togglePlay}
        onRemove={() => void removeTracks([track.requestId])}
        onNudge={(delta) => order.placeSoon(nudged(orderedIds, track.requestId, delta))}
        onDrop={() => void order.commit()}
        onArtistNavigate={() => onArtistNavigate(track)}
        onRetry={() => retryTracks.mutate({ trackIds: [track.requestId] })}
        isRetrying={retryingId === track.requestId}
      />
    );
  });

  return (
    <motion.div layoutScroll className={workshopScroll()}>
      {editable ? (
        <div className={tracksHead()}>
          <label className={tracksSelectAll()}>
            <Checkbox
              checked={allSelected ? true : selectedIds.length > 0 ? "indeterminate" : false}
              onCheckedChange={(value) => selection.setMany(orderedIds, value === true)}
              aria-label={t("selection.selectAll")}
            />
            {t("selection.selectAll")}
          </label>
          <span className={tracksHint()}>{t("workshop.tracks.dragHint")}</span>
        </div>
      ) : (
        <p className={tracksNotice()}>{t(lock === "rule" ? "workshop.tracks.lockedRule" : "workshop.tracks.locked")}</p>
      )}

      {editable && selectedIds.length > 0 ? (
        <BulkActionBar
          appearance="prominent"
          className={tracksBulk()}
          count={selectedIds.length}
          countLabel={t("selection.ofTotal", { total: orderedIds.length })}
          actions={bulkActions}
          clearLabel={t("selection.clear")}
          onClear={selection.clear}
        />
      ) : null}

      {ordered.length === 0 ? (
        <p className={tracksEmpty()}>{t("workshop.tracks.empty")}</p>
      ) : editable ? (
        <Reorder.Group axis="y" values={orderedIds} onReorder={order.arrange} as="ul" className={tracksList()}>
          {rows}
        </Reorder.Group>
      ) : (
        <ul className={tracksList()}>{rows}</ul>
      )}
    </motion.div>
  );
}
