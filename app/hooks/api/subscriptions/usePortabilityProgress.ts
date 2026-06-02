import { useEffect, useState } from "react";

import { subscribePortabilityProgress, type PortabilityProgressUpdate } from "./shared/portabilityProgress";

export function usePortabilityProgress(jobId: string | null): PortabilityProgressUpdate | null {
  const [progress, setProgress] = useState<PortabilityProgressUpdate | null>(null);

  useEffect(() => {
    setProgress(null);
    if (!jobId) return;
    return subscribePortabilityProgress(jobId, setProgress);
  }, [jobId]);

  return progress;
}
