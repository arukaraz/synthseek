import { useEffect, useState } from "react";

import { subscribePlaylistSyncAll, type PlaylistSyncAllUpdate } from "./shared/playlistSyncAll";

export function usePlaylistSyncAllProgress(): PlaylistSyncAllUpdate | null {
  const [progress, setProgress] = useState<PlaylistSyncAllUpdate | null>(null);

  useEffect(() => subscribePlaylistSyncAll(setProgress), []);

  return progress;
}
