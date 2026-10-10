import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSaveNotificationDestination() {
  const utils = trpc.useUtils();
  return trpc.notifications.save.useMutation({
    onSuccess: (destinations) => utils.notifications.list.setData(undefined, destinations),
    onError: (error) => errorToast(error, "notifications.saveFailed"),
  });
}

export function useRemoveNotificationDestination() {
  const utils = trpc.useUtils();
  return trpc.notifications.remove.useMutation({
    onSuccess: (destinations) => utils.notifications.list.setData(undefined, destinations),
    onError: (error) => errorToast(error, "notifications.removeFailed"),
  });
}

export function useTestNotificationDestination() {
  const utils = trpc.useUtils();
  return trpc.notifications.test.useMutation({
    onSettled: () => utils.notifications.list.invalidate(),
    onError: (error) => errorToast(error, "notifications.testFailed"),
  });
}

export function useUpdateNotificationAdminSettings() {
  const utils = trpc.useUtils();
  return trpc.notifications.updateAdminSettings.useMutation({
    onSuccess: (settings) => {
      utils.notifications.adminSettings.setData(undefined, settings);
      void utils.notifications.catalog.invalidate();
    },
    onError: (error) => errorToast(error, "notifications.settingsFailed"),
  });
}
