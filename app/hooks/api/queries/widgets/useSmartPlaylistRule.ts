import { trpc } from "@utils/trpc";

export function useSmartPlaylistRule(playlistId: string, enabled: boolean) {
  return trpc.widgets.playlistRule.useQuery({ playlistId }, { enabled });
}
