import { trpc } from "@utils/trpc";

export function useSetGrammar() {
  return trpc.widgets.setGrammar.useQuery(undefined, { staleTime: Number.POSITIVE_INFINITY });
}
