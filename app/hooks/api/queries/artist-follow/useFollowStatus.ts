import { trpc } from "@utils/trpc";

export function useFollowStatus(catalogArtistId: string | null) {
  return trpc.artistFollow.status.useQuery(
    { catalogArtistId: catalogArtistId ?? "" },
    { enabled: catalogArtistId !== null && catalogArtistId.length > 0 }
  );
}
