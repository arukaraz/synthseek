"use client";

import type { ColumnDef } from "@components/ui/Table";
import type { LibraryTrackPageItem } from "@hooks/api/queries/library/types";
import i18n from "@locale";

import { LibraryDurationCell } from "./cells/LibraryDurationCell";
import { LibraryPlaysCell } from "./cells/LibraryPlaysCell";
import { LibraryStatusCell } from "./cells/LibraryStatusCell";
import { TrackActionsCell } from "./cells/TrackActionsCell";
import { TrackLibraryPathCell } from "./cells/TrackLibraryPathCell";
import { TrackMetaCell } from "./cells/TrackMetaCell";
import { TrackPrimaryCell } from "./cells/TrackPrimaryCell";
import type { TrackColumnOptions } from "./types";

export function buildTrackColumns(options: TrackColumnOptions): ColumnDef<LibraryTrackPageItem>[] {
  return [
    {
      key: "title",
      header: i18n.t("library:page.columns.track"),
      cell: (item) => <TrackPrimaryCell item={item} onPlay={options.onPlay} />,
      className: "w-[30%]",
    },
    {
      key: "meta",
      header: i18n.t("library:page.columns.artistAlbum"),
      cell: (item) => <TrackMetaCell artist={item.artist} albumName={item.albumName} />,
      className: "hidden w-[30%] sm:table-cell",
    },
    {
      key: "status",
      header: i18n.t("library:page.columns.status"),
      cell: (item) => <LibraryStatusCell status={item.status} createdAt={item.created_at} />,
      className: "hidden w-36 md:table-cell",
    },
    {
      key: "plays",
      header: i18n.t("library:page.columns.plays"),
      cell: (item) => <LibraryPlaysCell plays={item.plays} />,
      className: "hidden w-[8%] text-right lg:table-cell",
    },
    ...(options.showLibraryPath
      ? [
          {
            key: "libraryPath",
            header: i18n.t("library:page.columns.libraryPath"),
            cell: (item: LibraryTrackPageItem) => <TrackLibraryPathCell libraryPath={item.libraryPath} />,
            className: "hidden w-[12%] md:table-cell",
          },
        ]
      : []),
    {
      key: "length",
      header: i18n.t("library:page.columns.length"),
      cell: (item) => <LibraryDurationCell durationMs={item.duration_ms} />,
      className: "w-[8%] text-right",
    },
    {
      key: "actions",
      header: "",
      cell: (item) => (
        <TrackActionsCell
          item={item}
          onEnqueue={options.onEnqueue}
          onSearchBetterQuality={options.onSearchBetterQuality}
          fileActions={options.fileActions}
        />
      ),
      className: "w-[4%]",
    },
  ];
}
