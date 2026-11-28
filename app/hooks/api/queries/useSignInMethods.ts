import { trpc } from "@utils/trpc";

const SIGN_IN_SEARCH_MAX_LENGTH = 4096;

export function useSignInMethods(search?: string) {
  const input = search === undefined ? undefined : { search: search.slice(0, SIGN_IN_SEARCH_MAX_LENGTH) };
  return trpc.auth.signInMethods.useQuery(input, {
    retry: 1,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
