import type { DownloadSourceKey } from "@api/__generated__/types";

import type { DownloadSourcesAvailability } from "../../../types";

export function availability(enabled: readonly DownloadSourceKey[] = []): DownloadSourcesAvailability {
  const entry = (key: DownloadSourceKey) => ({ enabled: enabled.includes(key), allowsSingleTracks: true });
  return {
    slskd: entry("slskd"),
    ytdlp: entry("ytdlp"),
    usenet: entry("usenet"),
    archive: entry("archive"),
    soundcloud: entry("soundcloud"),
    subsonic: entry("subsonic"),
    torrent: entry("torrent"),
  };
}
