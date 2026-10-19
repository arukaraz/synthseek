import { trpc } from "@utils/trpc";

export function useArtistsForYou(countryName: string) {
  return trpc.analytics.discover.artistsForYou.useQuery({ countryName });
}
