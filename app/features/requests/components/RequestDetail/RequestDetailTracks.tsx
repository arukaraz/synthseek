"use client";

import { DataTable, type ColumnDef } from "@components/ui/Table";
import { type TrackRequest } from "@api/__generated__/types";
import { confirm } from "@utils/confirm";
import { formatRelativeTime } from "@utils/formatters";
import { isOwnerOrAdminFE } from "@utils/authorization";
import { useCancelTrack, usePrioritizeTrack, useRetryTrack } from "@hooks/api";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { compareByStatus } from "../../helpers";
import { PriorityCell } from "./PriorityCell";
import { TrackActionsCell } from "./TrackActionsCell";
import { TrackStatusCell } from "./TrackStatusCell";
import { TrackTitleCell } from "./TrackTitleCell";
import type { RequestDetailTracksProps } from "./types";

export function RequestDetailTracks({ request }: RequestDetailTracksProps) {
  const { t } = useTranslation("requests");
  const { currentUser } = useAuthContext();
  const retryTrack = useRetryTrack();
  const cancelTrack = useCancelTrack();
  const prioritizeTrack = usePrioritizeTrack();
  const canAct = isOwnerOrAdminFE({ id: request.requestedBy.id }, currentUser);

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
        cell: (track) => <TrackStatusCell track={track} />,
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
            onRetry={() => retryTrack.mutate({ trackId: track.id })}
            onCancel={() => handleCancel(track)}
            onPrioritize={() => prioritizeTrack.mutate({ trackId: track.id })}
          />
        ),
        className: "w-20 text-right",
      },
    ],
    [canAct, retryTrack, prioritizeTrack, handleCancel, t]
  );

  const sortedTracks = useMemo(
    () => [...request.tracks].sort((a, b) => compareByStatus(a.status, b.status)),
    [request.tracks]
  );

  return (
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
  );
}
