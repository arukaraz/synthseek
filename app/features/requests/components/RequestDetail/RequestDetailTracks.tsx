"use client";

import { DataTable, type ColumnDef } from "@components/ui/Table";
import { ContentType, type TrackRequest } from "@api/__generated__/types";
import { confirm } from "@utils/confirm";
import { formatRelativeTime } from "@utils/formatters";
import { isOwnerOrAdminFE } from "@utils/authorization";
import {
  useApproveTracks,
  useCancelTrack,
  usePrioritizeTrack,
  useRejectTracks,
  useRequest,
  useRetryTrack,
  useSetWatch,
} from "@hooks/api";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { compareByStatus } from "../../helpers";
import { PriorityCell } from "./PriorityCell";
import { RejectApprovalDialog } from "./RejectApprovalDialog";
import { TrackActionsCell } from "./TrackActionsCell";
import { TrackStatusCell } from "./TrackStatusCell";
import { TrackTitleCell } from "./TrackTitleCell";
import type { RequestDetailTracksProps } from "./types";

export function RequestDetailTracks({ request }: RequestDetailTracksProps) {
  const { t } = useTranslation("requests");
  const { currentUser, isAdmin } = useAuthContext();
  const retryTrack = useRetryTrack();
  const cancelTrack = useCancelTrack();
  const prioritizeTrack = usePrioritizeTrack();
  const setWatch = useSetWatch();
  const approveTracks = useApproveTracks();
  const rejectTracks = useRejectTracks();
  const upgradeRequest = useRequest();
  const [rejectTrackId, setRejectTrackId] = useState<string | null>(null);
  const canAct = isOwnerOrAdminFE({ id: request.requestedBy.id }, currentUser);
  const isAlbum = request.contentType === ContentType.enum.album;
  const albumExternalId = request.external_id;

  const handleUpgrade = useCallback(
    (track: TrackRequest) => {
      upgradeRequest.mutate({
        track: {
          external_id: track.external_id,
          artist: track.artist,
          title: track.title,
          isrc: track.isrc,
          track_number: track.track_number,
          disc_number: track.disc_number,
          duration_ms: track.duration_ms,
          explicit: track.explicit,
        },
        config: {
          bitrate: { value: track.bitrate, matching: track.bitrate_matching },
          format: { value: track.format, matching: track.format_matching },
          upgrade: true,
        },
        album_external_id: isAlbum ? albumExternalId : `single_${track.external_id}`,
      });
    },
    [upgradeRequest, isAlbum, albumExternalId]
  );

  const handleCancel = useCallback(
    async (track: TrackRequest) => {
      const confirmed = await confirm({
        title: t("confirm.cancelTrackTitle"),
        message: t("confirm.cancelTrackMessage", { title: track.title, artist: track.artist }),
        variant: "danger",
        confirmText: t("confirm.cancelConfirm"),
        cancelText: t("confirm.cancelKeep"),
      });
      if (confirmed) cancelTrack.mutate({ trackId: track.id });
    },
    [cancelTrack, t]
  );

  const columns = useMemo<ColumnDef<TrackRequest>[]>(
    () => [
      {
        key: "title",
        header: t("tracks.trackHeader"),
        cell: (track) => <TrackTitleCell track={track} />,
      },
      {
        key: "artist",
        header: t("tracks.artistHeader"),
        cell: (track) => <span className="block truncate">{track.artist}</span>,
        className: "hidden lg:table-cell",
      },
      {
        key: "status",
        header: t("tracks.statusHeader"),
        cell: (track) => (
          <TrackStatusCell
            track={track}
            onRetryNow={canAct ? () => retryTrack.mutate({ trackId: track.id }) : undefined}
          />
        ),
        className: "w-44",
      },
      {
        key: "completed",
        header: t("tracks.completedHeader"),
        cell: (track) => (
          <span className="text-fg/40 text-xs">
            {track.completed_at ? formatRelativeTime(new Date(track.completed_at)) : "-"}
          </span>
        ),
        className: "hidden w-28 md:table-cell",
      },
      {
        key: "priority",
        header: t("tracks.priorityHeader"),
        cell: (track) => <PriorityCell track={track} />,
        className: "w-24",
      },
      {
        key: "actions",
        header: t("tracks.actionsHeader"),
        cell: (track) => (
          <TrackActionsCell
            track={track}
            canAct={canAct}
            canApprove={isAdmin}
            onRetry={() => retryTrack.mutate({ trackId: track.id })}
            onCancel={() => handleCancel(track)}
            onPrioritize={() => prioritizeTrack.mutate({ trackId: track.id })}
            onSetWatch={(enabled) => setWatch.mutate({ trackId: track.id, enabled })}
            onApprove={() => approveTracks.mutate({ trackIds: [track.id] })}
            onReject={() => setRejectTrackId(track.id)}
            onUpgrade={() => handleUpgrade(track)}
          />
        ),
        className: "w-20 text-right",
      },
    ],
    [canAct, isAdmin, retryTrack, prioritizeTrack, setWatch, approveTracks, handleCancel, handleUpgrade, t]
  );

  const sortedTracks = useMemo(
    () => [...request.tracks].sort((a, b) => compareByStatus(a.status, b.status)),
    [request.tracks]
  );

  return (
    <>
      <DataTable
        key={request.id}
        data={sortedTracks}
        columns={columns}
        getRowId={(track) => track.id}
        containerClassName="mx-3 mb-3 sm:mx-4 sm:mb-4"
        minWidth="480px"
        fixedLayout
        rowAttrs={(track) => ({ "data-status": track.status })}
        staggerDelay={0.01}
        emptyMessage={t("tracks.empty")}
      />
      <RejectApprovalDialog
        open={rejectTrackId !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTrackId(null);
        }}
        count={1}
        onConfirm={(reason) => {
          if (rejectTrackId) rejectTracks.mutate({ trackIds: [rejectTrackId], reason });
        }}
      />
    </>
  );
}
