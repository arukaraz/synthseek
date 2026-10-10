import { trpc } from "@utils/trpc";

export function useNotificationDestinations() {
  return trpc.notifications.list.useQuery(undefined, { refetchOnMount: "always" });
}
