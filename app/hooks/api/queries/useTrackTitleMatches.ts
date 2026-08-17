import { trpc } from "@utils/trpc";

export function useTrackTitleMatches(query: string) {
  const trimmed = query.trim();

  return trpc.requests.searchTrackTitles.useQuery(
    { query: trimmed },
    {
      enabled: trimmed.length > 0,
      staleTime: 10_000,
    }
  );
}
