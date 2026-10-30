import { trpc } from "@utils/trpc";

export function useWidgetGrammar() {
  return trpc.widgets.grammar.useQuery(undefined, { staleTime: Infinity });
}
