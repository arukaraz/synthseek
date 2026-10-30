import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSaveWidget() {
  const utils = trpc.useUtils();
  return trpc.widgets.save.useMutation({
    onSuccess: () => {
      void utils.widgets.list.invalidate();
      void utils.widgets.data.invalidate();
    },
    onError: (error) => errorToast(error, "widgets.saveFailed"),
  });
}
