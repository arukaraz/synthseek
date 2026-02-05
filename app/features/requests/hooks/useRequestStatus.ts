import { ContentType, RequestStatus } from "@api/__generated__/types";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useRequestStatus(status: RequestStatus, itemName: string, itemType: ContentType = "track") {
  const previousStatusRef = useRef<RequestStatus>(status);

  useEffect(() => {
    const prev = previousStatusRef.current;

    if (prev !== status) {
      if (status === RequestStatus.enum.complete) {
        toast.success(`${ContentType.enum[itemType]} download complete!`, {
          description: itemName,
        });
      } else if (status === RequestStatus.enum.failed) {
        toast.error(`${ContentType.enum[itemType]} download failed`, {
          description: itemName,
        });
      } else if (status === RequestStatus.enum.searching && prev === RequestStatus.enum.queued) {
        toast.info("Searching for sources...", { description: itemName });
      }
    }

    previousStatusRef.current = status;
  }, [status, itemName, itemType]);
}
