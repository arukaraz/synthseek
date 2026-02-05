"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { SectionLoading } from "@components/ui/SectionLoading";
import { AlbumCard } from "@features/requests/components/RequestCard/AlbumCard/AlbumCard";
import useAlbum from "@hooks/api/useAlbum";
import { calculateAlbumStatus } from "@utils/request-helpers";
import { motion } from "framer-motion";
import { Inbox, Search } from "lucide-react";
import { useMemo } from "react";
import { compactView } from "../components/styles";
import { SortConfig, STATUS_FILTER_MAP, StatusFilter } from "../types";
import { ContentType } from "@api/__generated__/types";

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
  const { albums: allAlbums, isLoading } = useAlbum();

  const sortedAlbums = useMemo(() => {
    const albums = [...(allAlbums ?? [])];

    const allowedStatuses = STATUS_FILTER_MAP[statusFilter];
    let filtered =
      allowedStatuses === null
        ? albums
        : albums.filter((a) => {
            const tracks = a.tracks ?? [];
            const { newStatus } = calculateAlbumStatus(tracks);
            return (allowedStatuses as readonly string[]).includes(newStatus);
          });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((album) => {
        if (album.name.toLowerCase().includes(query)) return true;
        if (album.artist.toLowerCase().includes(query)) return true;
        if (album.tracks?.some((track) => track.title.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    const direction = sort.direction === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sort.field) {
        case "recents":
          return direction * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        case ContentType.enum.artist:
          return direction * a.artist.localeCompare(b.artist);
        case ContentType.enum.album:
          return direction * a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [allAlbums, statusFilter, sort, searchQuery]);

  const isEmpty = !isLoading && sortedAlbums.length === 0;
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
          key={`${statusFilter}-${searchQuery ? "searching" : "all"}`}
          className={compactView()}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedAlbums.map((album) => (
            <motion.div key={album.id} variants={itemVariants}>
              <AlbumCard album={album} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
