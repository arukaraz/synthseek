import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useImportPlexUsers() {
  const utils = trpc.useUtils();
  return trpc.users.importPlex.useMutation({
    onSuccess: (result) => {
      utils.users.list.invalidate();
      utils.users.plexImportable.invalidate();
      const importedCount = result.imported.length;
      if (importedCount === 0) {
        toast.info(i18n.t("mutations:users.noNewImported"));
        return;
      }
      const skipped = result.skipped > 0 ? i18n.t("mutations:users.importedSkipped", { count: result.skipped }) : "";
      toast.success(i18n.t("mutations:users.imported", { count: importedCount, skipped }));
    },
    onError: (error) => errorToast(error, "users.importPlexFailed"),
  });
}
