import { trpc } from "@utils/trpc";

export function useStagedReleases(enabled: boolean) {
  return trpc.settings.stagedReleases.list.useQuery(undefined, { enabled });
}
