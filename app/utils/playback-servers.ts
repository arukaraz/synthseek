import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

export type PlaybackServerKey = inferRouterOutputs<AppRouter>["playback"]["sources"]["accounts"][number]["server"];

export const PLAYBACK_SERVER_NAMES = {
  plex: "Plex",
  navidrome: "Navidrome",
  jellyfin: "Jellyfin",
} as const satisfies Record<PlaybackServerKey, string>;

const NAMES = new Map<string, string>(Object.entries(PLAYBACK_SERVER_NAMES));

export function playbackServerName(key: string): string {
  return NAMES.get(key) ?? key;
}
