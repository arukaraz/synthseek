import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useRemoveWidget() {
  const utils = trpc.useUtils();
  return trpc.widgets.remove.useMutation({
    onSuccess: () => {
      void utils.widgets.list.invalidate();
      void utils.discovery.board.get.invalidate();
    },
    onError: (error) => errorToast(error, "widgets.removeFailed"),
  });
}
