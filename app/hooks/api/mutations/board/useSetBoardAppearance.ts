import { useCallback } from "react";

import type { BoardAppearance } from "@hooks/api/queries/board/types";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSetBoardAppearance(): (appearance: BoardAppearance) => void {
  const utils = trpc.useUtils();
  const { mutate } = trpc.discovery.board.setAppearance.useMutation({
    onError: (error) => {
      void utils.discovery.board.appearance.invalidate();
      errorToast(error, "discovery.appearanceSaveFailed");
    },
  });

  return useCallback(
    (appearance: BoardAppearance) => {
      void utils.discovery.board.appearance.cancel();
      utils.discovery.board.appearance.setData(undefined, appearance);
      mutate(appearance);
    },
    [utils, mutate]
  );
}
