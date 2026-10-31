import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateAudioAnalysis() {
  const utils = trpc.useUtils();
  return trpc.settings.updateLibraryAudioAnalysis.useMutation({
    onSuccess: () => {
      void utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.audioAnalysisSaved"));
    },
    onError: (error) => errorToast(error, "settings.audioAnalysisFailed"),
  });
}
