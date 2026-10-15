import { trpc } from "@utils/trpc";

export function useLibraryRules() {
  return trpc.library.rules.list.useQuery(undefined, { staleTime: 0, refetchOnMount: "always" });
}
