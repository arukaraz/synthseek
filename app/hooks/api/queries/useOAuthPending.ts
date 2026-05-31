import { trpc } from "@utils/trpc";

export function useOAuthPending(grant: string | null) {
  return trpc.oauthConsent.getPending.useQuery({ grant: grant ?? "" }, { enabled: Boolean(grant), retry: false });
}
