import { trpc } from "@utils/trpc";

export function useOrbitAlbums() {
  return trpc.analytics.discover.orbit.useQuery();
}
