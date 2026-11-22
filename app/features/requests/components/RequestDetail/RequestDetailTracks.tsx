"use client";

import { ContentType, type TrackRequest } from "@api/__generated__/types";
import { Checkbox } from "@components/ui/Checkbox";
import { DataTable, type ColumnDef } from "@components/ui/Table";
import { formatRelativeTime } from "@utils/formatters";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { canonicalPositions, hasMultipleDiscs, toTrackSortKey, trackActionsFor, trackNumberLabel } from "./helpers";
import { sortHeaderGroup, trackNumber } from "./styles";
import { TrackActionsCell } from "./TrackActionsCell";
import { TrackDetailPanel } from "./TrackDetailPanel";
import { TrackSortButton } from "./TrackSortButton";
import { TrackSourceCell } from "./TrackSourceCell";
import { TrackStatusCell } from "./TrackStatusCell";
import { TrackTitleCell } from "./TrackTitleCell";
import type { RequestDetailTracksProps } from "./types";

export function RequestDetailTracks({
  request,
  tracks,
  visible,
  sort,
  onSort,
  selectedIds,
  onSelectionChange,
  expandedId,
  onToggleExpanded,
  permissions,
  onAction,
}: RequestDetailTracksProps) {
  const { t } = useTranslation("requests");
  const isAlbum = request.contentType === ContentType.enum.album;
  const multiDisc = isAlbum && hasMultipleDiscs(tracks);
  const canonical = sort === null || sort.key === "number";
  const showDiscHeaders = multiDisc && canonical;
  const positions = useMemo(() => canonicalPositions(tracks), [tracks]);
  const selectable = permissions.canManage;
  const selectedVisible = visible.filter((track) => selectedIds.has(track.id)).length;
  const allSelected = visible.length > 0 && selectedVisible === visible.length;

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectionChange(next);
  };

  const toggleAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(visible.map((track) => track.id)));
  };

  const columns: ColumnDef<TrackRequest>[] = [
    ...(selectable
      ? [
          {
            key: "select",
            header: () => (
              <Checkbox
                checked={allSelected ? true : selectedVisible > 0 ? "indeterminate" : false}
                onCheckedChange={toggleAll}
                aria-label={t("bulk.selectVisible")}
              />
            ),
            cell: (track: TrackRequest) => (
              <Checkbox
                checked={selectedIds.has(track.id)}
                onCheckedChange={(checked) => toggleOne(track.id, checked === true)}
                aria-label={t("bulk.selectTrack", { title: track.title })}
              />
            ),
            className: "w-10",
          },
        ]
      : []),
    {
      key: "number",
      header: "#",
      sortable: true,
      cell: (track) => (
        <span className={trackNumber()}>
          {trackNumberLabel(track, positions.get(track.id) ?? 0, isAlbum, multiDisc && !canonical)}
        </span>
      ),
      className: "w-12 text-right",
    },
    {
      key: "title",
      header: () => (
        <span className={sortHeaderGroup()}>
          <TrackSortButton label={t("tracks.trackHeader")} sortKey="title" sort={sort} onSort={onSort} />
          <span aria-hidden>·</span>
          <TrackSortButton label={t("tracks.artistHeader")} sortKey="artist" sort={sort} onSort={onSort} />
        </span>
      ),
      cell: (track) => (
        <TrackTitleCell track={track} expanded={expandedId === track.id} onToggle={() => onToggleExpanded(track.id)} />
      ),
    },
    {
      key: "status",
      header: t("tracks.statusHeader"),
      sortable: true,
      cell: (track) => <TrackStatusCell track={track} />,
      className: "hidden w-56 @xl:table-cell",
    },
    {
      key: "source",
      header: t("tracks.sourceHeader"),
      sortable: true,
      cell: (track) => <TrackSourceCell track={track} />,
      className: "hidden w-36 @4xl:table-cell",
    },
    {
      key: "completed",
      header: t("tracks.completedHeader"),
      sortable: true,
      cell: (track) => (
        <span className="text-fg/40 text-xs">
          {track.completed_at ? formatRelativeTime(new Date(track.completed_at)) : "-"}
        </span>
      ),
      className: "hidden w-28 @3xl:table-cell",
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("tracks.actionsHeader")}</span>,
      cell: (track) => (
        <TrackActionsCell
          track={track}
          actions={trackActionsFor(track, permissions)}
          onAction={(id) => onAction(id, track)}
        />
      ),
      className: "w-12 text-right",
    },
  ];

  return (
    <DataTable
      data={visible}
      columns={columns}
      getRowId={(track) => track.id}
      sortState={sort === null ? undefined : { field: sort.key, direction: sort.direction }}
      onSort={(field) => {
        const key = toTrackSortKey(field);
        if (key !== null) onSort(key);
      }}
      containerClassName="@container mx-3 mb-3 sm:mx-4 sm:mb-4"
      minWidth="320px"
      fixedLayout
      rowAttrs={(track) => ({ "data-status": track.status, "data-track-id": track.id })}
      staggerDelay={0.01}
      onRowClick={(track) => onToggleExpanded(track.id)}
      emptyMessage={t(tracks.length === 0 ? "tracks.empty" : "tracks.emptyFiltered")}
      renderGroupHeader={(track, index) =>
        showDiscHeaders && (index === 0 || visible[index - 1]?.disc_number !== track.disc_number)
          ? t("tracks.disc", { number: track.disc_number })
          : null
      }
      renderExpansion={(track) =>
        expandedId === track.id ? (
          <TrackDetailPanel
            track={track}
            showPrivateDetails={permissions.canManage}
            actions={trackActionsFor(track, permissions)}
            onAction={(id) => onAction(id, track)}
          />
        ) : null
      }
    />
  );
}
