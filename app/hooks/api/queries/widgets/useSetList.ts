import { trpc } from "@utils/trpc";

export function useSetList(widgetId: string, slotId: string | null) {
  return trpc.widgets.setList.useQuery({ widgetId, slotId: slotId ?? "" }, { enabled: slotId !== null });
}
