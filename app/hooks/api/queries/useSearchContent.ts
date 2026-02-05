import type { ContentType } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

export default function useSearchContent(
  query: string,
  types: ContentType[],
  options?: {
    enabled?: boolean;
    limit?: number;
    offset?: number;
  }
) {
  const { enabled = true, limit = 20, offset = 0 } = options || {};

  return trpc.spotify.search.useQuery(
    {
      q: query,
      type: types.join(","),
      limit,
      offset,
    },
    {
      enabled: enabled && query.trim().length > 0,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  );
}
