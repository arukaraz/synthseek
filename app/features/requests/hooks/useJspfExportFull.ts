import { ContentType, type RequestWithTracks } from "@api/__generated__/types";
import { useExportFullPortability } from "@hooks/api/mutations/portability/useExportFullPortability";
import { downloadText } from "@utils/download";
import { generateUuid } from "@utils/uuid";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { exportFilename } from "../helpers";

export function useJspfExportFull(request: RequestWithTracks, onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation("requests");
  const [jobId, setJobId] = useState<string>("");
  const mutation = useExportFullPortability();

  const start = useCallback(() => {
    const id = generateUuid();
    setJobId(id);
    const type = request.contentType === ContentType.enum.playlist ? "playlist" : "album";
    mutation.mutate(
      { id: request.id, type, jobId: id },
      {
        onSuccess: (doc) => {
          downloadText(exportFilename(request.name), JSON.stringify(doc, null, 2));
          onOpenChange(false);
        },
        onError: () => toast.error(t("export.failed")),
      }
    );
  }, [mutation, request, onOpenChange, t]);

  return { jobId, start, isExporting: mutation.isPending };
}
