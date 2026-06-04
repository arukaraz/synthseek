import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateConnectionsSlskd() {
  const utils = trpc.useUtils();
  return trpc.settings.updateConnectionsSlskd.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.settings.slskdStatus.invalidate();
      toast.success(i18n.t("mutations:settings.slskdSaved"));
    },
    onError: (error) => errorToast(error, "settings.slskdFailed"),
  });
}

export function useUpdateConnectionsLidarr() {
  const utils = trpc.useUtils();
  return trpc.settings.updateConnectionsLidarr.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.settings.lidarrStatus.invalidate();
      toast.success(i18n.t("mutations:settings.lidarrSaved"));
    },
    onError: (error) => errorToast(error, "settings.lidarrFailed"),
  });
}

export function useTestLidarr() {
  return trpc.settings.testLidarr.useMutation();
}

export function useUpdateConnectionsPlex() {
  const utils = trpc.useUtils();
  return trpc.settings.updateConnectionsPlex.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.settings.plexStatus.invalidate();
    },
    onError: (error) => errorToast(error, "settings.plexFailed"),
  });
}

export function useUpdateConnectionsEnrichment() {
  const utils = trpc.useUtils();
  return trpc.settings.updateConnectionsEnrichment.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.enrichmentSaved"));
    },
    onError: (error) => errorToast(error, "settings.enrichmentFailed"),
  });
}

export function useTestSlskd() {
  return trpc.settings.testSlskd.useMutation();
}

export function useUpdateConnectionsSpotify() {
  const utils = trpc.useUtils();
  return trpc.settings.updateConnectionsSpotify.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.spotifySaved"));
    },
    onError: (error) => errorToast(error, "settings.spotifyFailed"),
  });
}
