import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import type { FollowReleaseState } from "@hooks/api/queries/artist-follow/types";

export type MyQuota = inferRouterOutputs<AppRouter>["requests"]["myQuota"];

export interface ReleaseAlbumRef {
  catalogAlbumId: string;
  title: string;
  artistName: string;
  cover: string | null;
}

export interface ReleaseArtistRef {
  catalogArtistId: string;
  name: string;
  cover: string | null;
  autoRequest: boolean;
}

export interface ReleaseMainActionProps {
  album: ReleaseAlbumRef;
  state: FollowReleaseState;
  autoRequest: boolean;
  compact?: boolean;
}

export interface ReleaseMoreMenuProps {
  artist: ReleaseArtistRef;
  album?: ReleaseAlbumRef;
  label: string;
  triggerClassName?: string;
}

export interface ReleaseActions {
  request: (album: ReleaseAlbumRef, intent: "direct" | "customize") => void;
  play: (album: ReleaseAlbumRef) => void;
  viewRequest: (album: ReleaseAlbumRef) => void;
  openAlbum: (album: ReleaseAlbumRef) => void;
  openArtist: (artist: ReleaseArtistRef) => void;
}
