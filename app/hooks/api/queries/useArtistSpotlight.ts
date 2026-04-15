import { trpc } from "@utils/trpc";

export function useArtistSpotlight(countryName: string, limit = 4) {
  return trpc.music.getArtistSpotlight.useQuery(
    { countryName, limit },
    {
      staleTime: 60 * 60 * 1000,
      gcTime: 2 * 60 * 60 * 1000,
      enabled: !!countryName,
    }
  );
}
