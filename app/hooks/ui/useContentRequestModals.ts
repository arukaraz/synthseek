"use client";

import { useCallback, useState } from "react";

import { ContentType, type MusicItem } from "@api/__generated__/types";
import type { RequestContext } from "@features/search/components/ContentBrowserModal/types";
import type { FlowState, UseContentRequestModalsResult } from "./types";

export function useContentRequestModals(): UseContentRequestModalsResult {
  const [state, setState] = useState<FlowState>({
    selectedResult: null,
    showContentBrowserModal: false,
    showConfigRequestModal: false,
    selectedContentToRequest: null,
    parentAlbumFromContext: null,
    configRequestMode: "download",
  });

  const openForResult = useCallback((result: MusicItem) => {
    if (result.type === ContentType.enum.track) {
      setState((prev) => ({
        ...prev,
        selectedResult: result,
        selectedContentToRequest: result,
        showConfigRequestModal: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        selectedResult: result,
        showContentBrowserModal: true,
      }));
    }
  }, []);

  const closeBrowser = useCallback(() => {
    setState((prev) => ({ ...prev, selectedResult: null, showContentBrowserModal: false }));
  }, []);

  const requestContent = useCallback((requestedItem: MusicItem, context?: RequestContext) => {
    if (
      requestedItem.type === ContentType.enum.track ||
      requestedItem.type === ContentType.enum.album ||
      requestedItem.type === ContentType.enum.playlist
    ) {
      setState((prev) => ({
        ...prev,
        selectedContentToRequest: requestedItem,
        parentAlbumFromContext: context?.parentAlbum ?? null,
        showConfigRequestModal: true,
        showContentBrowserModal: false,
        configRequestMode: "download",
      }));
    }
  }, []);

  const requestArtistLidarr = useCallback((artist: MusicItem) => {
    if (artist.type !== ContentType.enum.artist) return;
    setState((prev) => ({
      ...prev,
      selectedContentToRequest: artist,
      parentAlbumFromContext: null,
      showConfigRequestModal: true,
      showContentBrowserModal: false,
      configRequestMode: "lidarr-artist",
    }));
  }, []);

  const closeConfig = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showConfigRequestModal: false,
      selectedContentToRequest: null,
      parentAlbumFromContext: null,
      configRequestMode: "download",
    }));
  }, []);

  return {
    selectedResult: state.selectedResult,
    selectedContentToRequest: state.selectedContentToRequest,
    openForResult,
    requestArtistLidarr,
    browserModalProps: {
      open: state.showContentBrowserModal,
      onClose: closeBrowser,
      onRequestClick: requestContent,
      onRequestArtistLidarr: requestArtistLidarr,
    },
    configModalProps: {
      isOpen: state.showConfigRequestModal,
      item: state.selectedContentToRequest,
      itemType: state.selectedContentToRequest?.type ?? ContentType.enum.track,
      mode: state.configRequestMode,
      onClose: closeConfig,
      parentAlbum: state.parentAlbumFromContext,
    },
  };
}
