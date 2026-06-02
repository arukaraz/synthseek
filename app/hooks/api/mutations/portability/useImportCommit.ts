import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useImportCommit() {
  const utils = trpc.useUtils();

  return trpc.portability.commitImport.useMutation({
    onSuccess: (report) => {
      void utils.requests.invalidate();
      toast.success(`Imported ${report.imported} collection${report.imported === 1 ? "" : "s"}`, {
        description:
          report.unmatchedTracks > 0
            ? `${report.unmatchedTracks} track${report.unmatchedTracks === 1 ? "" : "s"} could not be matched`
            : undefined,
      });
    },
    onError: (error) => toast.error(error.message || "Import failed"),
  });
}
