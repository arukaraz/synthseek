import { trpc } from "@utils/trpc";

export function usePlaybackSourceAccounts() {
  return trpc.playback.sources.accounts.useQuery();
}
