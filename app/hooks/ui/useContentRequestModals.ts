"use client";

import { useCallback, useState } from "react";

import { ContentType, type MusicItem, type MusicTrack } from "@api/__generated__/types";
import type { DetailTarget } from "@features/content-detail";
import type { FlowState, RequestContext, UseContentRequestModalsResult } from "./types";

export function useContentRequestModals(): UseContentRequestModalsResult {
  const [state, setState] = useState<FlowState>({
    selectedResult: null,
    directTarget: null,
    showContentDetailModal: false,
    showConfigRequestModal: false,
    selectedContentToRequest: null,
    parentAlbumFromContext: null,
    preloadedTracks: null,
    configRequestMode: "download",
  });

  const openForResult = useCallback((result: MusicItem) => {
    if (result.type === ContentType.enum.track) {
      setState((prev) => ({
        ...prev,
        selectedResult: result,
        directTarget: null,
        selectedContentToRequest: result,
        showConfigRequestModal: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        selectedResult: result,
        directTarget: null,
        showContentDetailModal: true,
      }));
    }
  }, []);

  const openForTarget = useCallback((target: DetailTarget) => {
    setState((prev) => ({
      ...prev,
      selectedResult: null,
      directTarget: target,
      showContentDetailModal: true,
    }));
  }, []);

  const closeDetail = useCallback(() => {
    setState((prev) => ({ ...prev, selectedResult: null, directTarget: null, showContentDetailModal: false }));
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
        preloadedTracks: null,
        showConfigRequestModal: true,
        showContentDetailModal: false,
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
      preloadedTracks: null,
      showConfigRequestModal: true,
      showContentDetailModal: false,
      configRequestMode: "lidarr-artist",
    }));
  }, []);

  const requestPlaylistConfig = useCallback((playlist: MusicItem, preloadedTracks: MusicTrack[]) => {
    if (playlist.type !== ContentType.enum.playlist) return;
    setState((prev) => ({
      ...prev,
      selectedContentToRequest: playlist,
      parentAlbumFromContext: null,
      preloadedTracks,
      showConfigRequestModal: true,
      showContentDetailModal: false,
      configRequestMode: "download",
    }));
  }, []);

  const closeConfig = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showConfigRequestModal: false,
      selectedContentToRequest: null,
      parentAlbumFromContext: null,
      preloadedTracks: null,
      configRequestMode: "download",
    }));
  }, []);

  return {
    selectedResult: state.selectedResult,
    directTarget: state.directTarget,
    selectedContentToRequest: state.selectedContentToRequest,
    openForResult,
    openForTarget,
    requestContent,
    requestArtistLidarr,
    requestPlaylistConfig,
    contentDetailModalProps: {
      open: state.showContentDetailModal,
      onClose: closeDetail,
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
      preloadedTracks: state.preloadedTracks ?? undefined,
    },
  };
}
