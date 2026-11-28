import { trpc } from "@utils/trpc";

export function useOidcSignInMode() {
  return trpc.settings.oidcSignInMode.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}
