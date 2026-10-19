import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSaveBoardLayout() {
  const utils = trpc.useUtils();
  return trpc.discovery.board.save.useMutation({
    onMutate: async (layout) => {
      await utils.discovery.board.get.cancel();
      const before = utils.discovery.board.get.getData();
      utils.discovery.board.get.setData(undefined, layout);
      return { before };
    },
    onError: (error, _layout, context) => {
      utils.discovery.board.get.setData(undefined, context?.before);
      errorToast(error, "discovery.boardSaveFailed");
    },
    onSuccess: (saved) => {
      utils.discovery.board.get.setData(undefined, saved);
    },
  });
}
