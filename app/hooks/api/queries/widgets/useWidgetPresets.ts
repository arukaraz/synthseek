import { trpc } from "@utils/trpc";

export function useWidgetPresets() {
  return trpc.widgets.presets.useQuery(undefined, { staleTime: Infinity });
}
