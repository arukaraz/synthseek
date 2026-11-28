import { trpc } from "@utils/trpc";

export function useSignInIdentities() {
  return trpc.auth.signInIdentities.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}
