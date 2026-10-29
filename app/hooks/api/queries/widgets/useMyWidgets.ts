import { trpc } from "@utils/trpc";

export function useMyWidgets() {
  return trpc.widgets.list.useQuery();
}
