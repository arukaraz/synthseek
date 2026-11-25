import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { invalidateRequestListQueries } from "../../queries/requests/requestListCache";
import { toast } from "sonner";

export function useRetryAlbum() {
  const utils = trpc.useUtils();

  return trpc.requests.retryAlbum.useMutation({
    onError: (error) => errorToast(error, "requests.retryAlbumFailed"),
    onSuccess: () => toast.success(i18n.t("mutations:requests.albumRetryStarted")),
    onSettled: () => invalidateRequestListQueries(utils),
  });
}
