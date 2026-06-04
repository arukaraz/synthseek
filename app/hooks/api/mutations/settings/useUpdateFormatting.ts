import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateFormatting() {
  const utils = trpc.useUtils();
  return trpc.settings.updateFormatting.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.formattingSaved"));
    },
    onError: (error) => errorToast(error, "settings.formattingFailed"),
  });
}
