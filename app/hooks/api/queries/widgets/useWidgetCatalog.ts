import { trpc } from "@utils/trpc";

export function useWidgetCatalog() {
  return trpc.widgets.catalog.useQuery(undefined, { staleTime: Infinity });
}
