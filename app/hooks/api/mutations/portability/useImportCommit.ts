import { toast } from "sonner";

import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

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
    onError: (error) => errorToast(error, "portability.importFailed"),
  });
}
