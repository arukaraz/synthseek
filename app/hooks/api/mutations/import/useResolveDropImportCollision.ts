import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useResolveDropImportCollision() {
  const utils = trpc.useUtils();

  return trpc.import.resolveCollision.useMutation({
    onSuccess: (_data, variables) =>
      toast.success(
        i18n.t(
          variables.choice === "existing"
            ? "mutations:dropImport.collisionKeptExisting"
            : "mutations:dropImport.collisionUsedMine"
        )
      ),
    onError: (error) => errorToast(error, "dropImport.collisionFailed"),
    onSettled: () => {
      void utils.import.getBatch.invalidate();
      void utils.import.listBatches.invalidate();
    },
  });
}
