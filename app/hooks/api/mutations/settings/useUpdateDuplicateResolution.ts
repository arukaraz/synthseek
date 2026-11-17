import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateDuplicateResolution() {
  const utils = trpc.useUtils();
  return trpc.settings.updateLibraryDuplicates.useMutation({
    onSuccess: () => {
      void utils.settings.get.invalidate();
      void utils.library.scan.duplicateGroups.invalidate();
      toast.success(i18n.t("mutations:settings.duplicateResolutionSaved"));
    },
    onError: (error) => errorToast(error, "settings.duplicateResolutionFailed"),
  });
}
