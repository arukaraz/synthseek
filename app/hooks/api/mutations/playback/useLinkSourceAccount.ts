import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useLinkSourceAccount() {
  const utils = trpc.useUtils();
  return trpc.playback.sources.link.useMutation({
    onSuccess: (result) => utils.playback.sources.accounts.setData(undefined, result.accounts),
    onError: (error) => errorToast(error, "playback.sourceLinkFailed"),
  });
}

export function useUnlinkSourceAccount() {
  const utils = trpc.useUtils();
  return trpc.playback.sources.unlink.useMutation({
    onSuccess: (accounts) => utils.playback.sources.accounts.setData(undefined, accounts),
    onError: (error) => errorToast(error, "playback.sourceLinkFailed"),
  });
}
