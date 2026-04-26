"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { SectionLoading } from "@components/ui/SectionLoading";
import { RequestCard } from "@features/requests/components/RequestCard/RequestCard";
import { useTrackRequests } from "@hooks/api";
import { motion } from "framer-motion";
import { Inbox, Search } from "lucide-react";
import { useMemo } from "react";
import { compactView } from "../components/styles";
import { SortField, SortConfig, STATUS_FILTER_MAP, StatusFilter } from "../types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2 },
  },
};

interface CompactViewProps {
  statusFilter: StatusFilter;
  sort: SortConfig;
  searchQuery: string;
}

export function CompactView({ statusFilter, sort, searchQuery }: CompactViewProps) {
  const { data: items, isLoading } = useTrackRequests();

  const visibleItems = useMemo(() => {
    const all = items ?? [];

    const allowedStatuses = STATUS_FILTER_MAP[statusFilter];
    let filtered =
      allowedStatuses === null
        ? all
        : all.filter((item) => (allowedStatuses as readonly string[]).includes(item.status));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        if (item.name.toLowerCase().includes(query)) return true;
        if (item.artist.toLowerCase().includes(query)) return true;
        if (item.tracks?.some((track) => track.title.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.field) {
        case SortField.RECENT:
          return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        case SortField.ARTIST:
          return direction * a.artist.localeCompare(b.artist);
        case SortField.ALBUM:
        case SortField.PLAYLIST:
          return direction * a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [items, statusFilter, sort, searchQuery]);

  const isEmpty = !isLoading && visibleItems.length === 0;
  const isSearchEmpty = isEmpty && searchQuery.trim().length > 0;

  return (
    <div className="flex h-full flex-col">
      {isLoading ? (
        <SectionLoading message="Loading requests..." />
      ) : isSearchEmpty ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState icon={Search} title="No Results" description={`No requests match "${searchQuery}"`} />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState icon={Inbox} title="No Requests" description="Your download requests will appear here." />
        </div>
      ) : (
        <motion.div
          key={`${sort.field}-${statusFilter}-${searchQuery ? "searching" : "all"}`}
          className={compactView()}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {visibleItems.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <RequestCard request={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
