import type { AppRouter, MusicItem, MusicTrack } from "@api/__generated__/types";
import type { inferRouterInputs } from "@trpc/server";

import type { AlbumDelegate, ConfigRequestMode } from "../components/ConfigRequestModal/types";

type RouterInputs = inferRouterInputs<AppRouter>;

export type RequestConfigInput = NonNullable<RouterInputs["requests"]["request"]["config"]>;

export interface ContentRequestSubmission {
  item: MusicItem;
  mode: ConfigRequestMode;
  tracks: MusicTrack[];
  parentAlbum?: MusicItem | null;
  config?: RequestConfigInput;
  delegate?: AlbumDelegate;
  destinationPathId?: string;
  playlistName?: string;
}

export type SubmitOutcome = "sent" | "noTracks";

export interface DirectRequestTarget {
  item: MusicItem;
  mode: ConfigRequestMode;
  parentAlbum?: MusicItem | null;
  tracks?: MusicTrack[];
}

export interface PendingConfirmation {
  target: DirectRequestTarget;
  tracks: MusicTrack[];
  name: string;
}
