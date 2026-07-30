import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useSetWatch() {
  const utils = trpc.useUtils();

  return trpc.requests.setWatch.useMutation({
    onMutate: async ({ trackId, enabled }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        old?.map((item) => ({
          ...item,
          tracks: item.tracks.map((t) =>
            t.id === trackId
              ? {
                  ...t,
                  watch_enabled: enabled,
                  next_retry_at: null,
                  retry_count: enabled ? 0 : t.retry_count,
                }
              : t
          ),
        }))
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      errorToast(err, "requests.setWatchFailed");
    },
    onSuccess: (data) =>
      toast.success(i18n.t(data.enabled ? "mutations:requests.watchResumed" : "mutations:requests.watchStopped")),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
