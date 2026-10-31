import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

function useVetoInvalidation() {
  const utils = trpc.useUtils();
  return () => {
    void utils.widgets.veto.invalidate();
    void utils.widgets.vetoTracks.invalidate();
  };
}

export function useSaveVeto() {
  const invalidate = useVetoInvalidation();
  return trpc.widgets.saveVeto.useMutation({
    onSuccess: invalidate,
    onError: (error) => errorToast(error, "widgets.vetoFailed"),
  });
}

export function useBanTrack() {
  const invalidate = useVetoInvalidation();
  return trpc.widgets.banTrack.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success(i18n.t("mutations:widgets.trackBanned"));
    },
    onError: (error) => errorToast(error, "widgets.vetoFailed"),
  });
}

export function useBanArtist() {
  const invalidate = useVetoInvalidation();
  return trpc.widgets.banArtist.useMutation({
    onSuccess: (_, { artist }) => {
      invalidate();
      toast.success(i18n.t("mutations:widgets.artistBanned", { artist }));
    },
    onError: (error) => errorToast(error, "widgets.vetoFailed"),
  });
}
