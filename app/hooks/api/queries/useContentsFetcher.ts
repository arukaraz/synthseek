import { useCallback } from "react";

import type { ContentType } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

export function useContentsFetcher() {
  const utils = trpc.useUtils();
  return useCallback(
    (parentId: string, parentType: ContentType) =>
      utils.music.getContents.fetch({ parentId, parentType }, { staleTime: 10 * 60 * 1000 }),
    [utils]
  );
}
