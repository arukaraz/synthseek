"use client";

import { createContext, useContext, useMemo } from "react";

import { ContentType } from "@api/__generated__/types";
import {
  ContentDetailModal,
  albumRequestItem,
  artistRequestItem,
  detailTargetFromMusicItem,
  playlistOpenItem,
  playlistRequestTracks,
  trackRequestItem,
  type ContentDetailActions,
} from "@features/content-detail";
import { useContentRequestModals } from "@hooks/ui/useContentRequestModals";

import { useDirectRequest } from "../../hooks/useDirectRequest";
import { ConfigRequestModal } from "../ConfigRequestModal/ConfigRequestModal";
import { DirectRequestConfirm } from "../DirectRequestConfirm";
import type { ContentRequestFlowProps, FlowContextValue } from "./types";

const ContentRequestFlowContext = createContext<FlowContextValue | null>(null);

export function useContentRequestFlow(): FlowContextValue {
  const ctx = useContext(ContentRequestFlowContext);
  if (!ctx) throw new Error("useContentRequestFlow must be used within ContentRequestFlow");
  return ctx;
}

export function ContentRequestFlow({ children }: ContentRequestFlowProps) {
  const flow = useContentRequestModals();
  const direct = useDirectRequest();

  const detailTarget =
    flow.directTarget ??
    (flow.selectedResult && flow.selectedResult.type !== ContentType.enum.track
      ? detailTargetFromMusicItem(flow.selectedResult)
      : null);

  const detailActions = useMemo<ContentDetailActions>(
    () => ({
      requestAlbum: (input, intent = "direct") => {
        const item = albumRequestItem(input);
        if (intent === "customize") flow.requestContent(item);
        else void direct.request({ item, mode: "download" });
      },
      requestArtist: (input) => flow.requestArtistLidarr(artistRequestItem(input)),
      requestTrack: (input, intent = "direct") => {
        const item = trackRequestItem(input);
        if (intent === "customize") flow.requestContent(item);
        else void direct.request({ item, mode: "download" });
      },
      requestPlaylist: (input, intent = "direct") => {
        const item = playlistOpenItem({
          id: input.id,
          name: input.name,
          cover: input.cover,
          totalTracks: input.totalTracks,
        });
        const tracks = playlistRequestTracks(input.tracks);
        if (intent === "customize") flow.requestPlaylistConfig(item, tracks);
        else void direct.request({ item, mode: "download", tracks });
      },
      requestTopTracks: (input, intent = "direct") => {
        const item = artistRequestItem(input.artist);
        const tracks = playlistRequestTracks(input.tracks);
        if (intent === "customize") flow.requestArtistTracksConfig(item, tracks);
        else void direct.request({ item, mode: "artist-tracks", tracks });
      },
    }),
    [flow, direct]
  );

  return (
    <ContentRequestFlowContext.Provider
      value={{
        openForResult: flow.openForResult,
        openForTarget: flow.openForTarget,
        requestResult: (result, intent = "direct") => {
          if (intent === "customize") flow.requestContent(result);
          else void direct.request({ item: result, mode: "download" });
        },
      }}
    >
      {children}
      <ContentDetailModal
        open={flow.contentDetailModalProps.open}
        onClose={flow.contentDetailModalProps.onClose}
        target={detailTarget}
        actions={detailActions}
      />
      {flow.selectedContentToRequest && <ConfigRequestModal {...flow.configModalProps} onSuccess={() => {}} />}
      <DirectRequestConfirm pending={direct.pending} onConfirm={direct.confirm} onCancel={direct.cancel} />
    </ContentRequestFlowContext.Provider>
  );
}
