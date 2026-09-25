import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSetSourceReporting() {
  const utils = trpc.useUtils();
  return trpc.playback.sources.setReporting.useMutation({
    onSuccess: (accounts) => utils.playback.sources.accounts.setData(undefined, accounts),
    onError: (error) => errorToast(error, "playback.listeningSaveFailed"),
  });
}
