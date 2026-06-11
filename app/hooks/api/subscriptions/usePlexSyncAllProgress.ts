import { useEffect, useState } from "react";

import { subscribePlexSyncAll, type PlexSyncAllUpdate } from "./shared/plexSyncAll";

export function usePlexSyncAllProgress(): PlexSyncAllUpdate | null {
  const [progress, setProgress] = useState<PlexSyncAllUpdate | null>(null);

  useEffect(() => subscribePlexSyncAll(setProgress), []);

  return progress;
}
