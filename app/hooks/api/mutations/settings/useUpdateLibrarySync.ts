import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateLibrarySync() {
  const utils = trpc.useUtils();
  return trpc.settings.updateLibrary.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.librarySyncSaved"));
    },
    onError: (error) => errorToast(error, "settings.librarySyncFailed"),
  });
}
