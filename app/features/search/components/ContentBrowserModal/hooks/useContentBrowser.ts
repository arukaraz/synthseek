"use client";

import useGetContents from "@hooks/api/queries/useGetContents";
import { ContentType, type SpotifyItem } from "@api/__generated__/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContentMetadata } from "../types";

interface UseContentBrowserProps {
  initialType: ContentType;
  initialData: SpotifyItem;
}

export function useContentBrowser({ initialType, initialData }: UseContentBrowserProps) {
  const [navigationStack, setNavigationStack] = useState<
    Array<{
      type: ContentType;
      data: SpotifyItem;
    }>
  >([]);

  const [currentType, setCurrentType] = useState<ContentType>(initialType);
  const [currentData, setCurrentData] = useState<SpotifyItem>(initialData);

  useEffect(() => {
    setCurrentType(initialType);
    setCurrentData(initialData);
    setNavigationStack([]);
  }, [initialType, initialData]);

  const { data: fetchedContent, isLoading } = useGetContents(
    currentData?.id || "",
    !!currentData?.id && !!currentType,
    currentType
  );

  const items = useMemo((): SpotifyItem[] => {
    if (!fetchedContent?.content) return [];
    const content = Array.isArray(fetchedContent.content) ? fetchedContent.content : [];
    return content.filter(Boolean) as SpotifyItem[];
  }, [fetchedContent]);

  const metadata: ContentMetadata = useMemo(() => {
    if (!currentData) {
      return {
        title: "",
        subtitle: "",
        description: null,
        metadata: "",
        thumbnail: "",
        showRequestButton: false,
        albumCount: 0,
      };
    }

    switch (currentType) {
      case ContentType.enum.album: {
        const album = currentData as SpotifyApi.AlbumObjectSimplified;
        const releaseYear = album.release_date?.split("-")[0];
        const artistNames = album.artists?.map((a) => a.name).join(", ") || "Unknown Artist";
        return {
          title: album.name || "",
          subtitle: artistNames,
          metadata: `${releaseYear} • ${album.total_tracks || 0} tracks`,
          thumbnail: album.images?.[0]?.url || "",
          showRequestButton: true,
        };
      }

      case ContentType.enum.artist: {
        const artist = currentData as SpotifyApi.ArtistObjectFull;
        const genres = artist.genres?.slice(0, 2).join(", ") || "";
        const followers = artist.followers?.total.toLocaleString() || "0";
        return {
          title: artist.name || "",
          subtitle: genres || "Artist",
          metadata: `${followers} followers`,
          thumbnail: artist.images?.[0]?.url || "",
          showRequestButton: false,
          albumCount: items.length || 0,
        };
      }

      default:
        return {
          title: "",
          subtitle: "",
          description: null,
          metadata: "",
          thumbnail: "",
          showRequestButton: false,
          albumCount: 0,
        };
    }
  }, [currentType, currentData, items.length]);

  const handleRowClick = useCallback(
    (item: SpotifyItem) => {
      if (item.type === ContentType.enum.album) {
        setNavigationStack((prev) => [...prev, { type: currentType, data: currentData }]);
        setCurrentType(ContentType.enum.album);
        setCurrentData(item);
      }
    },
    [currentType, currentData]
  );

  const handleBack = useCallback(() => {
    if (navigationStack.length > 0) {
      const previousView = navigationStack[navigationStack.length - 1];
      setNavigationStack((prev) => prev.slice(0, -1));
      setCurrentType(previousView.type);
      setCurrentData(previousView.data);
    }
  }, [navigationStack]);

  const canGoBack = navigationStack.length > 0;

  return {
    metadata,
    items,
    isLoading,
    canGoBack,
    currentType,
    currentData,
    handleRowClick,
    handleBack,
  };
}
