import { keepPreviousData, skipToken } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import type { WidgetDraft } from "./types";

export function useWidgetPreview(draft: WidgetDraft | null, timeZone: string) {
  return trpc.widgets.preview.useQuery(draft ? { draft, timeZone } : skipToken, {
    placeholderData: keepPreviousData,
    retry: false,
  });
}
