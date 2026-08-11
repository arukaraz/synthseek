import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useDiscardHeldImport() {
  const utils = trpc.useUtils();

  return trpc.requests.review.discard.useMutation({
    onSuccess: ({ fileRemoved }) => {
      toast.success(i18n.t("mutations:review.discarded.title"), {
        description: fileRemoved
          ? i18n.t("mutations:review.discarded.fileRemoved")
          : i18n.t("mutations:review.discarded.fileAlreadyGone"),
      });
    },
    onError: (error) => errorToast(error, "review.discardFailed"),
    onSettled: () => utils.requests.review.list.invalidate(),
  });
}
