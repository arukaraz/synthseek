"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useCategoryPlaylists } from "@hooks/api/queries/useCategoryPlaylists";
import { Results } from "@features/search/components/Results/Results";
import { ContentBrowserModal } from "@features/search/components/ContentBrowserModal/ContentBrowserModal";
import ConfigRequestModal from "@features/search/components/ConfigRequestModal/ConfigRequestModal";
import { ContentType } from "@api/__generated__/types";
import type { RequestContext } from "@features/search/components/ContentBrowserModal/types";
import type { SpotifyItem } from "@api/__generated__/types";
import { backButton } from "@features/search/components/styles";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, ListMusic } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

const PLAYLISTS_LIMIT = 50;

function PlaylistsSkeleton() {
  return (
    <div className="grid-responsive-results">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-fg/5 aspect-square overflow-hidden rounded-lg">
          <div className="from-fg/10 to-fg/5 h-full w-full animate-pulse bg-gradient-to-br" />
        </div>
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = params.categoryId as string;
  const categoryName = searchParams.get("name") ?? "Category";

  const { data, isLoading, isError } = useCategoryPlaylists(categoryId, categoryName, PLAYLISTS_LIMIT);

  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyItem | null>(null);
  const [showContentBrowserModal, setShowContentBrowserModal] = useState(false);
  const [showConfigRequestModal, setShowConfigRequestModal] = useState(false);
  const [selectedContentToRequest, setSelectedContentToRequest] = useState<SpotifyItem | null>(null);
  const [parentAlbumFromContext, setParentAlbumFromContext] = useState<SpotifyItem | null>(null);

  const playlists = data?.data?.items ?? [];

  const handlePlaylistClick = (playlistId: string, _type: ContentType) => {
    const playlist = playlists.find((p: { id: string }) => p.id === playlistId);
    if (playlist) {
      setSelectedPlaylist(playlist as unknown as SpotifyItem);
      setShowContentBrowserModal(true);
    }
  };

  const handleCloseContentBrowserModal = () => {
    setSelectedPlaylist(null);
    setShowContentBrowserModal(false);
  };

  const handleRequestContentClick = (requestedItem: SpotifyItem, context?: RequestContext) => {
    if (requestedItem.type === ContentType.enum.track || requestedItem.type === ContentType.enum.album) {
      setSelectedContentToRequest(requestedItem);
      setParentAlbumFromContext(context?.parentAlbum ?? null);
      setShowConfigRequestModal(true);
      setShowContentBrowserModal(false);
    }
  };

  const handleConfigModalClose = () => {
    setShowConfigRequestModal(false);
    setSelectedContentToRequest(null);
    setParentAlbumFromContext(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-fg/10 flex-shrink-0 border-b">
        <div className="p-4 sm:p-6">
          <button onClick={() => router.back()} className={backButton()}>
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </button>
          <h1 className="text-fg text-xl font-bold sm:text-2xl">{categoryName}</h1>
          <p className="text-fg/60 mt-1 text-sm">
            {isLoading ? "Loading playlists..." : `${playlists.length} playlists`}
          </p>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-auto p-4 sm:p-6">
        {isLoading ? (
          <PlaylistsSkeleton />
        ) : isError ? (
          <EmptyState
            icon={AlertCircle}
            title="Failed to load playlists"
            description="Unable to fetch playlists for this category. Please try again later."
          />
        ) : playlists.length === 0 ? (
          <EmptyState icon={ListMusic} title="No Playlists" description="No playlists found for this category." />
        ) : (
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Results results={playlists as unknown as SpotifyItem[]} onResultClick={handlePlaylistClick} />
          </motion.div>
        )}
      </div>

      {selectedPlaylist && (
        <ContentBrowserModal
          type={ContentType.enum.playlist}
          data={selectedPlaylist}
          onClose={handleCloseContentBrowserModal}
          open={showContentBrowserModal}
          onRequestClick={handleRequestContentClick}
        />
      )}

      {selectedContentToRequest && (
        <ConfigRequestModal
          isOpen={showConfigRequestModal}
          item={selectedContentToRequest}
          itemType={selectedContentToRequest.type}
          onClose={handleConfigModalClose}
          parentAlbum={parentAlbumFromContext}
        />
      )}
    </div>
  );
}
