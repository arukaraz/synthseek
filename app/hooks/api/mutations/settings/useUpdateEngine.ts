import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateEngineQueue() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineQueue.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.queueSaved"));
    },
    onError: (error) => errorToast(error, "settings.queueFailed"),
  });
}

export function useUpdateEngineSearch() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineSearch.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.searchSaved"));
    },
    onError: (error) => errorToast(error, "settings.searchFailed"),
  });
}

export function useUpdateEngineTimeouts() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineTimeouts.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.timeoutsSaved"));
    },
    onError: (error) => errorToast(error, "settings.timeoutsFailed"),
  });
}

export function useUpdateEngineImport() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineImport.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.importSaved"));
    },
    onError: (error) => errorToast(error, "settings.importFailed"),
  });
}

export function useUpdateEnginePlexBehavior() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEnginePlexBehavior.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.plexBehaviorSaved"));
    },
    onError: (error) => errorToast(error, "settings.plexBehaviorFailed"),
  });
}

export function useUpdateEngineWanted() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineWanted.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.wantedSaved"));
    },
    onError: (error) => errorToast(error, "settings.wantedFailed"),
  });
}

export function useUpdateEngineQuality() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineQuality.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.qualitySaved"));
    },
    onError: (error) => errorToast(error, "settings.qualityFailed"),
  });
}

export function useUpdateEngineReview() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineReview.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.reviewSaved"));
    },
    onError: (error) => errorToast(error, "settings.reviewFailed"),
  });
}

export function useUpdateEngineSmartSearch() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineSmartSearch.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.smartSearchSaved"));
    },
    onError: (error) => errorToast(error, "settings.smartSearchFailed"),
  });
}
