import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUndoBoardTemplate() {
  const utils = trpc.useUtils();
  return trpc.discovery.board.templateUndo.useMutation({
    onSuccess: (restored) => {
      utils.discovery.board.get.setData(undefined, restored.layout);
      utils.discovery.board.appearance.setData(undefined, restored.appearance);
      void utils.widgets.list.invalidate();
    },
    onError: (error) => errorToast(error, "discovery.templateUndoFailed"),
  });
}
