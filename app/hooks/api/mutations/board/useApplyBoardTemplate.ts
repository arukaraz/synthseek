import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useApplyBoardTemplate() {
  const utils = trpc.useUtils();
  return trpc.discovery.board.templateApply.useMutation({
    onSuccess: (applied) => {
      utils.discovery.board.get.setData(undefined, applied.layout);
      utils.discovery.board.appearance.setData(undefined, applied.appearance);
      void utils.widgets.list.invalidate();
    },
    onError: (error) => errorToast(error, "discovery.templateApplyFailed"),
  });
}
