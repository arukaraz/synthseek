import { skipToken } from "@tanstack/react-query";

import type { DownloadSourceKey } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

export function useRequestIdsBySource(source: DownloadSourceKey | null) {
  return trpc.requests.idsBySource.useQuery(source === null ? skipToken : { source }, { staleTime: 10_000 });
}
