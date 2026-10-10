import { trpc } from "@utils/trpc";

export function useNotificationAdminSettings() {
  return trpc.notifications.adminSettings.useQuery();
}
