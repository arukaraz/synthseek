"use client";

import { ContentType } from "@api/__generated__/types";
import { Button } from "@components/ui/Button";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useHoldRequestListRefresh } from "@hooks/api";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { isOwnerOrAdminFE } from "@utils/authorization";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useTrackActionHandlers } from "../../hooks/useTrackActionHandlers";
import { nextTrackSort, orderTracks, trackGroupOf } from "./helpers";
import { KeptReleaseNotice } from "./KeptReleaseNotice";
import { RejectApprovalDialog } from "./RejectApprovalDialog";
import { RequestDetailBulkBar } from "./RequestDetailBulkBar";
import { RequestDetailSummary } from "./RequestDetailSummary";
import { RequestDetailTracks } from "./RequestDetailTracks";
import { RequestReleaseProgress } from "./RequestReleaseProgress";
import { tracksLoadFailed } from "./styles";
import { TrackSortNote } from "./TrackSortNote";
import type { RequestDetailBodyProps, TrackGroup, TrackSort } from "./types";

export function RequestDetailBody({ request, tracks, isResolving, hasFailed, onRetryLoad }: RequestDetailBodyProps) {
  const { t } = useTranslation("requests");
  const { currentUser, isAdmin } = useAuthContext();
  const [filter, setFilter] = useState<ReadonlySet<TrackGroup>>(new Set());
  const [sort, setSort] = useState<TrackSort | null>(null);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const handlers = useTrackActionHandlers(() => setSelectedIds(new Set()));
  useHoldRequestListRefresh(selectedIds.size > 0 || handlers.rejectCount > 0);
  const permissions = { canManage: isOwnerOrAdminFE({ id: request.requestedBy.id }, currentUser), isAdmin };
  const visible = orderTracks(tracks, filter, sort);
  const selected = visible.filter((track) => selectedIds.has(track.id));

  const applyFilter = (next: ReadonlySet<TrackGroup>) => {
    setFilter(next);
    setSelectedIds(
      new Set(
        tracks
          .filter((track) => selectedIds.has(track.id) && (next.size === 0 || next.has(trackGroupOf(track))))
          .map((track) => track.id)
      )
    );
  };

  const toggleFilter = (group: TrackGroup) => {
    const next = new Set(filter);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    applyFilter(next);
  };

  const tracksBlock = hasFailed ? (
    <div className={tracksLoadFailed()}>
      <p className="text-fg/60 text-sm">{t("tracks.loadFailed")}</p>
      <Button variant="secondary" size="sm" onClick={onRetryLoad}>
        {t("tracks.loadRetry")}
      </Button>
    </div>
  ) : isResolving ? (
    <SectionLoading message={t("loading.tracks")} className="min-h-40" />
  ) : (
    <>
      {sort !== null ? (
        <TrackSortNote
          sort={sort}
          isPlaylist={request.contentType === ContentType.enum.playlist}
          onReset={() => setSort(null)}
        />
      ) : null}
      <RequestDetailTracks
        request={request}
        tracks={tracks}
        visible={visible}
        sort={sort}
        onSort={(key) => setSort(nextTrackSort(sort, key))}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        expandedId={expandedId}
        onToggleExpanded={(id) => setExpandedId(expandedId === id ? null : id)}
        permissions={permissions}
        onAction={handlers.runTrackAction}
      />
      <RequestDetailBulkBar
        selected={selected}
        permissions={permissions}
        onClear={() => setSelectedIds(new Set())}
        onBulk={(id, targets) => void handlers.runBulkAction(id, targets)}
      />
    </>
  );

  return (
    <>
      <RequestDetailSummary
        request={request}
        tracks={tracks}
        isResolving={isResolving || hasFailed}
        filter={filter}
        onToggleFilter={toggleFilter}
        onClearFilter={() => applyFilter(new Set())}
      />
      <RequestReleaseProgress tracks={tracks} />
      <KeptReleaseNotice request={request} />
      {tracksBlock}
      <RejectApprovalDialog
        open={handlers.rejectCount > 0}
        onOpenChange={(open) => {
          if (!open) handlers.closeReject();
        }}
        count={handlers.rejectCount}
        onConfirm={handlers.confirmReject}
      />
    </>
  );
}
