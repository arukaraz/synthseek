import { trpc } from "@utils/trpc";

export function useImportPreview() {
  return trpc.portability.previewImport.useMutation();
}
