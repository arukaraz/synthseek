import type { PortabilityProgressPayload } from "@api/__generated__/types";

import { emitPortabilityProgress } from "../../shared/portabilityProgress";

export function handlePortabilityProgress(event: PortabilityProgressPayload): void {
  emitPortabilityProgress(event.jobId, {
    processed: event.processed,
    total: event.total,
    phase: event.phase,
  });
}
