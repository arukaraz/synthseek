import { ContentType, type RequestWithTracks } from "@api/__generated__/types";
import { useExportFullPortability } from "@hooks/api/mutations/portability/useExportFullPortability";
import { downloadText } from "@utils/download";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { exportFilename } from "../helpers";

export function useJspfExportFull(request: RequestWithTracks, onOpenChange: (open: boolean) => void) {
  const [jobId, setJobId] = useState<string>("");
  const mutation = useExportFullPortability();

  const start = useCallback(() => {
    const id = crypto.randomUUID();
    setJobId(id);
    const type = request.contentType === ContentType.enum.playlist ? "playlist" : "album";
    mutation.mutate(
      { id: request.id, type, jobId: id },
      {
        onSuccess: (doc) => {
          downloadText(exportFilename(request.name), JSON.stringify(doc, null, 2));
          onOpenChange(false);
        },
        onError: () => toast.error("Export failed"),
      }
    );
  }, [mutation, request, onOpenChange]);

  return { jobId, start, isExporting: mutation.isPending };
}
