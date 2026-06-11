import type { PortabilityProgressPayload } from "@api/__generated__/types";

import { emitPortabilityProgress } from "../../shared/portabilityProgress";
import { markDockItem } from "../../shared/progressDock";

export function handlePortabilityProgress(event: PortabilityProgressPayload): void {
  emitPortabilityProgress(event.jobId, {
    processed: event.processed,
    total: event.total,
    phase: event.phase,
  });

  if (event.collection) {
    markDockItem(event.jobId, event.collection.key, event.collection.state);
  }
}
