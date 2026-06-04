import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useDeleteAllRequests() {
  const utils = trpc.useUtils();

  return trpc.requests.deleteAll.useMutation({
    onError: (error) => errorToast(error, "requests.deleteAllFailed"),
    onSuccess: (data) => toast.success(i18n.t("mutations:requests.deletedAll", { count: data.deleted })),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
