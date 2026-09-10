import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSaveLibraryNaming() {
  const utils = trpc.useUtils();
  return trpc.library.naming.save.useMutation({
    onSuccess: (result) => {
      if (result.outcome === "organise_busy") {
        toast.warning(i18n.t("settings:libraryNaming.toast.organiseBusy"));
        return;
      }
      utils.library.naming.current.invalidate();
      utils.library.organise.preview.invalidate();
      toast.success(i18n.t("settings:libraryNaming.toast.saved"));
    },
    onError: (error) => errorToast(error, "settings.namingFailed"),
  });
}
