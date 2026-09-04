"use client";

import type { ColumnDef } from "@components/ui/Table";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import i18n from "@locale";

import { TrackStatusIndicator } from "@components/TrackStatusIndicator";

import { LibraryDurationCell } from "./cells/LibraryDurationCell";
import { LibraryRequestedAtCell } from "./cells/LibraryRequestedAtCell";
import { TrackMetaCell } from "./cells/TrackMetaCell";
import { TrackPrimaryCell } from "./cells/TrackPrimaryCell";
import type { TrackColumnOptions } from "./types";

export function buildTrackColumns(options: TrackColumnOptions): ColumnDef<LibraryTrackItem>[] {
  return [
    {
      key: "title",
      header: i18n.t("library:page.columns.track"),
      cell: (item) => <TrackPrimaryCell item={item} onPlay={options.onPlay} />,
    },
    {
      key: "meta",
      header: i18n.t("library:page.columns.artistAlbum"),
      cell: (item) => <TrackMetaCell artist={item.artist} albumName={item.albumName} />,
      className: "hidden sm:table-cell",
    },
    {
      key: "status",
      header: i18n.t("library:page.columns.status"),
      cell: (item) => <TrackStatusIndicator status={item.status} />,
      className: "hidden md:table-cell",
    },
    {
      key: "requestedAt",
      header: i18n.t("library:page.columns.requestedAt"),
      cell: (item) => <LibraryRequestedAtCell createdAt={item.created_at} />,
      className: "hidden lg:table-cell",
    },
    {
      key: "length",
      header: i18n.t("library:page.columns.length"),
      cell: (item) => <LibraryDurationCell durationMs={item.duration_ms} />,
      className: "w-20 text-right",
    },
  ];
}
