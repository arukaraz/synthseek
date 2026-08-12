import type { PortabilityProgressPayload } from "@api/__generated__/types";

import { isForeignJobEvent } from "../../shared/eventOwnership";
import { emitPortabilityProgress } from "../../shared/portabilityProgress";
import { markDockItem } from "../../shared/progressDock";

export function handlePortabilityProgress(event: PortabilityProgressPayload, viewerId: string | null): void {
  emitPortabilityProgress(event.jobId, {
    processed: event.processed,
    total: event.total,
    phase: event.phase,
  });

  if (isForeignJobEvent(event.userId, viewerId)) return;

  if (event.collection) {
    markDockItem(event.jobId, event.collection.key, event.collection.state);
  }
}
