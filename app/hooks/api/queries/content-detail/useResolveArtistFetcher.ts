import { trpc } from "@utils/trpc";
import { useCallback } from "react";

export function useResolveArtistFetcher() {
  const utils = trpc.useUtils();
  return useCallback((name: string) => utils.contentDetail.resolveArtist.fetch({ name }), [utils]);
}
