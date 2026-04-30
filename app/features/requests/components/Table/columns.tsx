"use client";

import { type ColumnDef } from "@components/ui/Table";
import { formatRelativeTime, titleCase } from "@utils/formatters";
import type { FlatTrackRow } from "../../types";
import { TrackActionsCell } from "./cells/TrackActionsCell";
import { TrackStatusCell } from "./cells/TrackStatusCell";
import { TrackTitleCell } from "./cells/TrackTitleCell";

interface BuildColumnsArgs {
  currentUserId: string | undefined;
  canActFor: (item: FlatTrackRow) => boolean;
  onRetry: (item: FlatTrackRow) => void;
  onCancel: (item: FlatTrackRow) => void;
}

export function buildFlatTrackColumns({
  currentUserId,
  canActFor,
  onRetry,
  onCancel,
}: BuildColumnsArgs): ColumnDef<FlatTrackRow>[] {
  return [
    {
      key: "title",
      header: "Title",
      cell: (item) => <TrackTitleCell item={item} />,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => <TrackStatusCell status={item.status} />,
      sortable: true,
    },
    {
      key: "album",
      header: "Album",
      cell: (item) => <span className="text-fg/60 truncate text-sm">{item.parent.name}</span>,
      sortable: true,
    },
    {
      key: "artist",
      header: "Artist",
      cell: (item) => <span className="text-fg/60 truncate text-sm">{item.artist}</span>,
      sortable: true,
    },
    {
      key: "type",
      header: "Type",
      cell: (item) => <span className="text-fg/60 text-xs">{titleCase(item.parent.contentType)}</span>,
      sortable: true,
    },
    {
      key: "requestedBy",
      header: "Requested by",
      cell: (item) => (
        <span className="text-fg/60 truncate text-xs">
          {currentUserId === item.parent.requestedBy.id ? "you" : item.parent.requestedBy.username}
        </span>
      ),
      sortable: true,
    },
    {
      key: "created_at",
      header: "Added",
      cell: (item) => <span className="text-fg/40 text-xs">{formatRelativeTime(new Date(item.created_at))}</span>,
      sortable: true,
    },
    {
      key: "completed_at",
      header: "Completed",
      cell: (item) => (
        <span className="text-fg/40 text-xs">
          {item.completed_at ? formatRelativeTime(new Date(item.completed_at)) : "-"}
        </span>
      ),
      sortable: true,
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
        />
      ),
      className: "w-20",
    },
  ];
}
