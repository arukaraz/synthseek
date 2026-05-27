"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { ContentType, type MusicItem } from "@api/__generated__/types";
import ConfigRequestModal from "../ConfigRequestModal/ConfigRequestModal";
import { ContentBrowserModal } from "../ContentBrowserModal/ContentBrowserModal";
import type { RequestContext } from "../ContentBrowserModal/types";
import type { ContentRequestFlowProps, FlowContextValue, FlowState } from "./types";

const ContentRequestFlowContext = createContext<FlowContextValue | null>(null);

export function useContentRequestFlow(): FlowContextValue {
  const ctx = useContext(ContentRequestFlowContext);
  if (!ctx) throw new Error("useContentRequestFlow must be used within ContentRequestFlow");
  return ctx;
}

export function ContentRequestFlow({ children }: ContentRequestFlowProps) {
  const [state, setState] = useState<FlowState>({
    selectedResult: null,
    showContentBrowserModal: false,
    showConfigRequestModal: false,
    selectedContentToRequest: null,
    parentAlbumFromContext: null,
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

  const handleCloseContentBrowserModal = useCallback(() => {
    setState((prev) => ({ ...prev, selectedResult: null, showContentBrowserModal: false }));
  }, []);

  const handleRequestContentClick = useCallback((requestedItem: MusicItem, context?: RequestContext) => {
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
      }));
    }
  }, []);

  const handleConfigModalClose = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showConfigRequestModal: false,
      selectedContentToRequest: null,
      parentAlbumFromContext: null,
    }));
  }, []);

  return (
    <ContentRequestFlowContext.Provider value={{ openForResult }}>
      {children}
      {state.selectedResult && state.selectedResult.type !== ContentType.enum.track && (
        <ContentBrowserModal
          type={state.selectedResult.type}
          data={state.selectedResult}
          onClose={handleCloseContentBrowserModal}
          open={state.showContentBrowserModal}
          onRequestClick={handleRequestContentClick}
        />
      )}
      {state.selectedContentToRequest && (
        <ConfigRequestModal
          isOpen={state.showConfigRequestModal}
          item={state.selectedContentToRequest}
          itemType={state.selectedContentToRequest.type}
          onClose={handleConfigModalClose}
          onSuccess={() => {}}
          parentAlbum={state.parentAlbumFromContext}
        />
      )}
    </ContentRequestFlowContext.Provider>
  );
}
