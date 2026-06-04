import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateLibrarySubscription() {
  const utils = trpc.useUtils();
  return trpc.librarySource.subscription.update.useMutation({
    onSuccess: () => {
      utils.librarySource.subscription.get.invalidate();
    },
    onError: (error) => errorToast(error, "spotify.libraryWatcherFailed"),
  });
}
