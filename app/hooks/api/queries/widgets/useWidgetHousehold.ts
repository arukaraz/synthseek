import { trpc } from "@utils/trpc";

export function useWidgetHousehold() {
  return trpc.widgets.household.useQuery();
}
