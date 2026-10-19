import type { RecentAlbum } from "@hooks/api/queries/analytics/types";

import type { DownloadedAlbum } from "./types";

export function downloadedAlbums(albums: readonly RecentAlbum[]): DownloadedAlbum[] {
  return albums.flatMap((album) =>
    album.source === null || album.minutes === null ? [] : [{ ...album, source: album.source, minutes: album.minutes }]
  );
}
