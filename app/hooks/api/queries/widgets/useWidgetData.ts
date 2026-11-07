import { trpc } from "@utils/trpc";

import type { WidgetDocument } from "./types";

export function useWidgetData(widget: Pick<WidgetDocument, "id" | "query">, timeZone: string, enabled = true) {
  return trpc.widgets.data.useQuery(
    { id: widget.id, timeZone },
    { enabled, trpc: { context: { skipBatch: widget.query.type === "feed" } } }
  );
}
