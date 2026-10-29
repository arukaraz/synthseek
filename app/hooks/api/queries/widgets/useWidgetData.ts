import { trpc } from "@utils/trpc";

export function useWidgetData(id: string, timeZone: string) {
  return trpc.widgets.data.useQuery({ id, timeZone });
}
