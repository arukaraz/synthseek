"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useTrackRequests } from "@hooks/api";
import { Inbox, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Table } from "../components/Table/Table";
import { FlatTrackRow, TableSortConfig } from "../types";

interface ListViewProps {
  searchQuery: string;
}

export function ListView({ searchQuery }: ListViewProps) {
  const { data: items, isLoading } = useTrackRequests();

  const [sort, setSort] = useState<TableSortConfig>({ field: "created_at", direction: "desc" });

  const rows = useMemo<FlatTrackRow[]>(() => {
    const flat: FlatTrackRow[] = (items ?? []).flatMap((item) =>
      item.tracks.map((track) => ({
        ...track,
        parent: {
          id: item.id,
          name: item.name,
          artist: item.artist,
          album_art: item.album_art,
          contentType: item.contentType,
          requestedBy: item.requestedBy,
        },
      }))
    );

    const filtered = searchQuery.trim()
      ? flat.filter((row) => {
          const query = searchQuery.toLowerCase();
          if (row.title.toLowerCase().includes(query)) return true;
          if (row.artist.toLowerCase().includes(query)) return true;
          if (row.parent.name.toLowerCase().includes(query)) return true;
          return false;
        })
      : flat;

    const direction = sort.direction === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      switch (sort.field) {
        case "title":
          return direction * a.title.localeCompare(b.title);
        case "status":
          return direction * a.status.localeCompare(b.status);
        case "artist":
          return direction * a.artist.localeCompare(b.artist);
        case "album":
          return direction * a.parent.name.localeCompare(b.parent.name);
        case "type":
          return direction * a.parent.contentType.localeCompare(b.parent.contentType);
        case "requestedBy":
          return direction * a.parent.requestedBy.username.localeCompare(b.parent.requestedBy.username);
        case "created_at":
          return direction * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        case "completed_at": {
          const aDate = a.completed_at ? new Date(a.completed_at).getTime() : 0;
          const bDate = b.completed_at ? new Date(b.completed_at).getTime() : 0;
          return direction * (bDate - aDate);
        }
        default:
          return 0;
      }
    });
  }, [items, sort, searchQuery]);

  const isEmpty = !isLoading && rows.length === 0;
  const isSearchEmpty = isEmpty && searchQuery.trim().length > 0;

  if (isLoading) {
    return <SectionLoading message="Loading requests..." />;
  }

  if (isSearchEmpty) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState icon={Search} title="No Results" description={`No requests match "${searchQuery}"`} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState icon={Inbox} title="No Requests" description="Your download requests will appear here." />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table items={rows} sort={sort} onSortChange={setSort} />
    </div>
  );
}
