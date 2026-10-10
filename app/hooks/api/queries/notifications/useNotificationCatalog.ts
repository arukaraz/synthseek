import { trpc } from "@utils/trpc";

export function useNotificationCatalog() {
  return trpc.notifications.catalog.useQuery(undefined, { refetchOnMount: "always" });
}
