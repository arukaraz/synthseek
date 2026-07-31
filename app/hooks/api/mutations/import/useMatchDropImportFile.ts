import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useMatchDropImportFile() {
  const utils = trpc.useUtils();

  return trpc.import.matchFile.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:dropImport.fileMatched")),
    onError: (error) => errorToast(error, "dropImport.matchFailed"),
    onSettled: () => {
      void utils.import.getBatch.invalidate();
      void utils.import.listBatches.invalidate();
    },
  });
}
