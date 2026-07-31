import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useDiscardDropImportFile() {
  const utils = trpc.useUtils();

  return trpc.import.discardFile.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:dropImport.fileDiscarded")),
    onError: (error) => errorToast(error, "dropImport.discardFailed"),
    onSettled: () => {
      void utils.import.getBatch.invalidate();
      void utils.import.listBatches.invalidate();
    },
  });
}
