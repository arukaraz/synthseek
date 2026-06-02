import { trpc } from "@utils/trpc";

export function useExportFullPortability() {
  return trpc.portability.exportFullPortability.useMutation();
}
