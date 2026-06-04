"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useCategoryPlaylists } from "@hooks/api/queries/useCategoryPlaylists";
import { Results } from "@features/search/components/Results/Results";
import { ContentBrowserModal } from "@features/search/components/ContentBrowserModal/ContentBrowserModal";
import { ConfigRequestModal } from "@features/search/components/ConfigRequestModal/ConfigRequestModal";
import { ContentType, type MusicItem } from "@api/__generated__/types";
import type { RequestContext } from "@features/search/components/ContentBrowserModal/types";
import { backButton } from "@features/search/components/styles";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, ListMusic } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentSkeleton } from "./components/ContentSkeleton";
import { CONTENT_LIMIT } from "./constants";

export function CategoryScreen() {
  const { t } = useTranslation("discover");
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = params.categoryId as string;
  const categoryName = searchParams.get("name") ?? t("category.fallbackName");

  const { data, isLoading, isError } = useCategoryPlaylists(categoryId, categoryName, CONTENT_LIMIT);

  const [selectedItem, setSelectedItem] = useState<MusicItem | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ContentType>(ContentType.enum.artist);
  const [showContentBrowserModal, setShowContentBrowserModal] = useState(false);
  const [showConfigRequestModal, setShowConfigRequestModal] = useState(false);
  const [selectedContentToRequest, setSelectedContentToRequest] = useState<MusicItem | null>(null);
  const [parentAlbumFromContext, setParentAlbumFromContext] = useState<MusicItem | null>(null);

  const genreContent = data?.data;
  const albums = useMemo(() => (genreContent?.albums ?? []) as MusicItem[], [genreContent]);
  const playlists = useMemo(() => (genreContent?.playlists?.items ?? []) as MusicItem[], [genreContent]);

  const handleItemClick = (itemId: string, type: ContentType) => {
    const allItems = [...albums, ...playlists];
    const item = allItems.find((i) => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setSelectedItemType(type);
      setShowContentBrowserModal(true);
    }
  };

  const handleCloseContentBrowserModal = () => {
    setSelectedItem(null);
    setShowContentBrowserModal(false);
  };

  const handleRequestContentClick = (requestedItem: MusicItem, context?: RequestContext) => {
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

  const hasContent = albums.length > 0 || playlists.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-fg/10 shrink-0 border-b">
        <div className="p-4 sm:p-6">
          <button onClick={() => router.back()} className={backButton()}>
            <ArrowLeft className="h-4 w-4" />
            {t("category.back")}
          </button>
          <h1 className="text-fg text-xl font-bold sm:text-2xl">{categoryName}</h1>
          <p className="text-fg/60 mt-1 text-sm">
            {isLoading
              ? t("category.loading")
              : t("category.counts", { albums: albums.length, playlists: playlists.length })}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {isLoading ? (
          <ContentSkeleton />
        ) : isError ? (
          <EmptyState
            icon={AlertCircle}
            title={t("category.errorTitle")}
            description={t("category.errorDescription")}
          />
        ) : !hasContent ? (
          <EmptyState icon={ListMusic} title={t("category.emptyTitle")} description={t("category.emptyDescription")} />
        ) : (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-8">
            {albums.length > 0 && (
              <div>
                <h2 className="text-fg mb-4 text-lg font-semibold">{t("category.albumsHeading")}</h2>
                <Results results={albums} onResultClick={handleItemClick} />
              </div>
            )}
            {playlists.length > 0 && (
              <div>
                <h2 className="text-fg mb-4 text-lg font-semibold">{t("category.playlistsHeading")}</h2>
                <Results results={playlists} onResultClick={handleItemClick} />
              </div>
            )}
          </motion.div>
        )}
      </div>

      {selectedItem && (
        <ContentBrowserModal
          type={selectedItemType}
          data={selectedItem}
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
