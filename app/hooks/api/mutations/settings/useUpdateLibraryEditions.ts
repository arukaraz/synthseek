import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateLibraryEditions() {
  const utils = trpc.useUtils();
  return trpc.settings.updateLibraryEditions.useMutation({
    onSuccess: () => {
      void utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.libraryEditionsSaved"));
    },
    onError: (error) => errorToast(error, "settings.libraryEditionsFailed"),
  });
}
