import { trpc } from "@utils/trpc";

const GENRES_STALE_MS = 5 * 60 * 1000;

export function useSetGenres(enabled = true) {
  return trpc.widgets.setGenres.useQuery(undefined, { enabled, staleTime: GENRES_STALE_MS });
}
