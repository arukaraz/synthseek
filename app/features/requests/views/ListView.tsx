"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { SectionLoading } from "@components/ui/SectionLoading";
import useRequest from "@hooks/api/useRequest";
import { Inbox, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Table } from "../components/Table/Table";
import { TableSortConfig } from "../types";

interface ListViewProps {
  searchQuery: string;
}

export function ListView({ searchQuery }: ListViewProps) {
  const { requests: tracks, isLoading } = useRequest();

  const [sort, setSort] = useState<TableSortConfig>({ field: "created_at", direction: "desc" });

  const sortedTracks = useMemo(() => {
    let safeTracks = tracks ?? [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      safeTracks = safeTracks.filter((track) => {
        if (track.title.toLowerCase().includes(query)) return true;
        if (track.artist.toLowerCase().includes(query)) return true;
        if (track.Album?.name?.toLowerCase().includes(query)) return true;
        return false;
      });
    }

    const direction = sort.direction === "asc" ? 1 : -1;

    return [...safeTracks].sort((a, b) => {
      switch (sort.field) {
        case "title":
          return direction * a.title.localeCompare(b.title);
        case "status":
          return direction * a.status.localeCompare(b.status);
        case "artist":
          return direction * a.artist.localeCompare(b.artist);
        case "album":
          return direction * (a.Album?.name ?? "").localeCompare(b.Album?.name ?? "");
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
  }, [tracks, sort, searchQuery]);

  const isEmpty = !isLoading && sortedTracks.length === 0;
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
      <Table items={sortedTracks} sort={sort} onSortChange={setSort} />
    </div>
  );
}
