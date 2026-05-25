import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateEngineQueue() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineQueue.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Queue settings saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save queue settings"),
  });
}

export function useUpdateEngineSearch() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineSearch.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Search settings saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save search settings"),
  });
}

export function useUpdateEngineTimeouts() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineTimeouts.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Timeouts saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save timeouts"),
  });
}

export function useUpdateEngineImport() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineImport.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Import settings saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save import settings"),
  });
}

export function useUpdateEnginePlexBehavior() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEnginePlexBehavior.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Plex behavior saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save Plex behavior"),
  });
}

export function useUpdateEngineSmartSearch() {
  const utils = trpc.useUtils();
  return trpc.settings.updateEngineSmartSearch.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Smart search settings saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save smart search settings"),
  });
}
