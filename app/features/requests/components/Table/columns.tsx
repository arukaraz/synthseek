"use client";

import { type ColumnDef } from "@components/ui/Table";
import i18n from "@locale";
import { formatRelativeTime } from "@utils/formatters";
import type { FlatTrackRow } from "../../types";
import { PriorityCell } from "./cells/PriorityCell";
import { SourceCell } from "./cells/SourceCell";
import { TrackActionsCell } from "./cells/TrackActionsCell";
import { TrackStatusCell } from "./cells/TrackStatusCell";
import { TrackTitleCell } from "./cells/TrackTitleCell";
import { contentTypeLabel } from "./helpers";
import type { BuildColumnsArgs } from "./types";

export function buildFlatTrackColumns({
  currentUserId,
  canActFor,
  onRetry,
  onCancel,
  onPrioritize,
  onSelectSource,
}: BuildColumnsArgs): ColumnDef<FlatTrackRow>[] {
  return [
    {
      key: "title",
      header: i18n.t("requests:table.titleHeader"),
      cell: (item) => <TrackTitleCell item={item} />,
      sortable: true,
    },
    {
      key: "status",
      header: i18n.t("requests:table.statusHeader"),
      cell: (item) => <TrackStatusCell status={item.status} />,
      sortable: true,
    },
    {
      key: "album",
      header: i18n.t("requests:table.albumHeader"),
      cell: (item) => <SourceCell item={item} onSelect={onSelectSource} />,
      sortable: true,
    },
    {
      key: "artist",
      header: i18n.t("requests:table.artistHeader"),
      cell: (item) => <span className="text-fg/60 truncate text-sm">{item.artist}</span>,
      sortable: true,
    },
    {
      key: "type",
      header: i18n.t("requests:table.typeHeader"),
      cell: (item) => <span className="text-fg/60 text-xs">{contentTypeLabel(item.parent.contentType)}</span>,
      sortable: true,
    },
    {
      key: "requestedBy",
      header: i18n.t("requests:table.requestedByHeader"),
      cell: (item) => (
        <span className="text-fg/60 truncate text-xs">
          {currentUserId === item.parent.requestedBy.id
            ? i18n.t("requests:table.requestedByYou")
            : item.parent.requestedBy.username}
        </span>
      ),
      sortable: true,
    },
    {
      key: "created_at",
      header: i18n.t("requests:table.addedHeader"),
      cell: (item) => <span className="text-fg/40 text-xs">{formatRelativeTime(new Date(item.created_at))}</span>,
      sortable: true,
    },
    {
      key: "completed_at",
      header: i18n.t("requests:table.completedHeader"),
      cell: (item) => (
        <span className="text-fg/40 text-xs">
          {item.completed_at ? formatRelativeTime(new Date(item.completed_at)) : "-"}
        </span>
      ),
      sortable: true,
    },
    {
      key: "priority",
      header: i18n.t("requests:tracks.priorityHeader"),
      cell: (item) => <PriorityCell item={item} />,
      className: "w-24",
    },
    {
      key: "actions",
      header: "",
      cell: (item) => (
        <TrackActionsCell
          item={item}
          canAct={canActFor(item)}
          onRetry={() => onRetry(item)}
          onCancel={() => onCancel(item)}
          onPrioritize={() => onPrioritize(item)}
        />
      ),
      className: "w-20",
    },
  ];
}
