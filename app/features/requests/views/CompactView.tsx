"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { SectionLoading } from "@components/ui/SectionLoading";
import { RequestCard } from "@features/requests/components/RequestCard/RequestCard";
import useAlbum from "@hooks/api/useAlbum";
import { trpc } from "@utils/trpc";
import { calculateAlbumStatus } from "@utils/request-helpers";
import type { AlbumWithTracks } from "@api/__generated__/types";
import { ContentType, RequestStatus } from "@api/__generated__/types";
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

interface RequestItem {
  data: AlbumWithTracks;
  contentType: typeof ContentType.enum.album | typeof ContentType.enum.playlist;
}

export function CompactView({ statusFilter, sort, searchQuery }: CompactViewProps) {
  const { albums: allAlbums, isLoading: albumsLoading } = useAlbum();
  const { data: playlists, isLoading: playlistsLoading } = trpc.requests.getAllPlaylists.useQuery(undefined);

  const isLoading = albumsLoading || playlistsLoading;

  const items = useMemo((): RequestItem[] => {
    const userAlbums: RequestItem[] = (allAlbums ?? [])
      .filter((album) => album.tracks?.some((t) => t.request_type !== ContentType.enum.playlist))
      .map((album) => ({ data: album, contentType: ContentType.enum.album }));

    const playlistItems: RequestItem[] = (playlists ?? []).map((pl) => ({
      data: {
        id: pl.id,
        external_id: pl.external_id,
        name: pl.name,
        artist: pl.owner,
        album_art: pl.image,
        user_id: null,
        release_date: String(pl.created_at).split("T")[0],
        total_tracks: pl.total_tracks,
        completed_tracks: pl.completed_tracks,
        status: RequestStatus.parse(pl.status),
        created_at: new Date(pl.created_at),
        updated_at: new Date(pl.updated_at),
        tracks: pl.tracks.map((pt) => pt.TrackRequest),
      },
      contentType: ContentType.enum.playlist,
    }));

    const all = [...userAlbums, ...playlistItems];

    const allowedStatuses = STATUS_FILTER_MAP[statusFilter];
    let filtered =
      allowedStatuses === null
        ? all
        : all.filter((item) => {
            const { newStatus } = calculateAlbumStatus(item.data.tracks ?? []);
            return (allowedStatuses as readonly string[]).includes(newStatus);
          });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        if (item.data.name.toLowerCase().includes(query)) return true;
        if (item.data.artist.toLowerCase().includes(query)) return true;
        if (item.data.tracks?.some((track) => track.title.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    const direction = sort.direction === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sort.field) {
        case SortField.RECENT:
          return direction * (new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime());
        case SortField.ARTIST:
          return direction * a.data.artist.localeCompare(b.data.artist);
        case SortField.ALBUM:
        case SortField.PLAYLIST:
          return direction * a.data.name.localeCompare(b.data.name);
        default:
          return 0;
      }
    });
  }, [allAlbums, playlists, statusFilter, sort, searchQuery]);

  const isEmpty = !isLoading && items.length === 0;
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
          {items.map((item) => (
            <motion.div key={item.data.id} variants={itemVariants}>
              <RequestCard album={item.data} contentType={item.contentType} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
