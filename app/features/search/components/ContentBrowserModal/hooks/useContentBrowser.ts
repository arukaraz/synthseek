"use client";

import { useGetContents } from "@hooks/api/queries/useGetContents";
import { ContentType, type MusicItem, type MusicPlaylistTrack } from "@api/__generated__/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ContentMetadata } from "../types";

interface UseContentBrowserProps {
  initialType: ContentType;
  initialData: MusicItem;
  preloadedItems?: MusicItem[];
}

export function useContentBrowser({ initialType, initialData, preloadedItems }: UseContentBrowserProps) {
  const { t } = useTranslation("search");
  const [navigationStack, setNavigationStack] = useState<
    Array<{
      type: ContentType;
      data: MusicItem;
    }>
  >([]);

  const [currentType, setCurrentType] = useState<ContentType>(initialType);
  const [currentData, setCurrentData] = useState<MusicItem>(initialData);

  useEffect(() => {
    setCurrentType(initialType);
    setCurrentData(initialData);
    setNavigationStack([]);
  }, [initialType, initialData]);

  const id = currentData?.id || "";

  const usePreloaded = !!preloadedItems && !!id && id === initialData.id;
  const { data: fetchedContent, isLoading } = useGetContents(id, !usePreloaded && !!id && !!currentType, currentType);

  const items = useMemo((): MusicItem[] => {
    if (usePreloaded && preloadedItems) return preloadedItems;
    if (!fetchedContent?.content) return [];
    const content = Array.isArray(fetchedContent.content) ? fetchedContent.content : [];

    if (currentType === ContentType.enum.playlist) {
      const playlistTracks = content as MusicPlaylistTrack[];
      return playlistTracks.filter((item) => item?.track).map((item) => item.track);
    }

    return content.filter(Boolean) as MusicItem[];
  }, [usePreloaded, preloadedItems, fetchedContent, currentType]);

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

    switch (currentData.type) {
      case ContentType.enum.album: {
        const releaseYear = currentData.release_date?.split("-")[0];
        const artistNames =
          currentData.artists?.map((a) => a.name).join(", ") || currentData.artist || t("browser.unknownArtist");
        const trackCount = currentData.total_tracks || items.length || 0;
        return {
          title: currentData.name,
          subtitle: artistNames,
          metadata: [releaseYear, t("browser.trackCount", { count: trackCount })].filter(Boolean).join(" • "),
          thumbnail: currentData.images?.[0]?.url || "",
          showRequestButton: true,
        };
      }

      case ContentType.enum.track: {
        const artistNames = currentData.artists?.[0]?.name || currentData.artist || t("browser.unknownArtist");
        return {
          title: currentData.title,
          subtitle: artistNames,
          metadata: "",
          thumbnail: ("images" in currentData ? currentData.images?.[0]?.url : undefined) || "",
          showRequestButton: true,
        };
      }

      case ContentType.enum.artist: {
        const genres = currentData.genres?.slice(0, 2).join(", ") || "";
        const followersText = currentData.followers
          ? t("browser.followers", {
              count: currentData.followers,
              value: currentData.followers.toLocaleString(),
            })
          : "";
        const albumCount = items.length || 0;
        return {
          title: currentData.name,
          subtitle: genres || t("browser.artistBadge"),
          metadata: [followersText, t("browser.albumCount", { count: albumCount })].filter(Boolean).join(" • "),
          thumbnail: currentData.images?.[0]?.url || "",
          showRequestButton: false,
          albumCount,
        };
      }

      case ContentType.enum.playlist: {
        return {
          title: currentData.name,
          subtitle: currentData.owner?.name || t("browser.unknown"),
          metadata: t("browser.trackCount", { count: currentData.total_tracks }),
          thumbnail: currentData.images?.[0]?.url || "",
          showRequestButton: true,
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
  }, [currentData, items.length, t]);

  const handleRowClick = useCallback(
    (item: MusicItem) => {
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
