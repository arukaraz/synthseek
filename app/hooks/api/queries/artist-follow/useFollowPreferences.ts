import { trpc } from "@utils/trpc";

export function useFollowPreferences(enabled = true) {
  return trpc.artistFollow.preferences.useQuery(undefined, { enabled });
}
