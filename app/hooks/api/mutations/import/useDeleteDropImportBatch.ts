import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useDeleteDropImportBatch() {
  const utils = trpc.useUtils();

  return trpc.import.deleteBatch.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:dropImport.batchDeleted")),
    onError: (error) => errorToast(error, "dropImport.deleteFailed"),
    onSettled: () => {
      void utils.import.listBatches.invalidate();
      void utils.import.getBatch.invalidate();
    },
  });
}
