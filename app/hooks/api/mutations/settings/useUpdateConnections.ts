import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateConnectionsSlskd() {
  const utils = trpc.useUtils();
  return trpc.settings.updateConnectionsSlskd.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Slskd connection updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update Slskd settings"),
  });
}

export function useUpdateConnectionsPlex() {
  const utils = trpc.useUtils();
  return trpc.settings.updateConnectionsPlex.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.settings.plexStatus.invalidate();
    },
    onError: (error) => toast.error(error.message || "Failed to update Plex settings"),
  });
}

export function useUpdateConnectionsEnrichment() {
  const utils = trpc.useUtils();
  return trpc.settings.updateConnectionsEnrichment.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Enrichment settings updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update enrichment settings"),
  });
}

export function useTestSlskd() {
  return trpc.settings.testSlskd.useMutation();
}
