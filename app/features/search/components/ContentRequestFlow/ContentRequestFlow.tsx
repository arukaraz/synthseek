"use client";

import { createContext, useContext, useMemo } from "react";

import { ContentType } from "@api/__generated__/types";
import {
  ContentDetailModal,
  albumRequestItem,
  artistRequestItem,
  detailTargetFromMusicItem,
  playlistRequestPayload,
  trackRequestItem,
  type ContentDetailActions,
} from "@features/content-detail";
import { usePlaylistRequest } from "@hooks/api";
import { useContentRequestModals } from "@hooks/ui/useContentRequestModals";
import { ConfigRequestModal } from "../ConfigRequestModal/ConfigRequestModal";
import type { ContentRequestFlowProps, FlowContextValue } from "./types";

const ContentRequestFlowContext = createContext<FlowContextValue | null>(null);

export function useContentRequestFlow(): FlowContextValue {
  const ctx = useContext(ContentRequestFlowContext);
  if (!ctx) throw new Error("useContentRequestFlow must be used within ContentRequestFlow");
  return ctx;
}

export function ContentRequestFlow({ children }: ContentRequestFlowProps) {
  const flow = useContentRequestModals();
  const playlistRequest = usePlaylistRequest();

  const detailTarget =
    flow.directTarget ??
    (flow.selectedResult && flow.selectedResult.type !== ContentType.enum.track
      ? detailTargetFromMusicItem(flow.selectedResult)
      : null);

  const detailActions = useMemo<ContentDetailActions>(
    () => ({
      requestAlbum: (input) => flow.requestContent(albumRequestItem(input)),
      requestArtist: (input) => flow.requestArtistLidarr(artistRequestItem(input)),
      requestTrack: (input) => flow.requestContent(trackRequestItem(input)),
      requestPlaylist: (input) => playlistRequest.mutate(playlistRequestPayload(input)),
    }),
    [flow, playlistRequest]
  );

  return (
    <ContentRequestFlowContext.Provider
      value={{ openForResult: flow.openForResult, openForTarget: flow.openForTarget }}
    >
      {children}
      <ContentDetailModal
        open={flow.contentDetailModalProps.open}
        onClose={flow.contentDetailModalProps.onClose}
        target={detailTarget}
        actions={detailActions}
      />
      {flow.selectedContentToRequest && <ConfigRequestModal {...flow.configModalProps} onSuccess={() => {}} />}
    </ContentRequestFlowContext.Provider>
  );
}
