import { useCallback } from "react";

import type { BoardLayout } from "@hooks/api/queries/board/types";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { BOARD_SAVE_SCOPE } from "./constants";

export function useSaveBoardLayout(): (layout: BoardLayout) => void {
  const utils = trpc.useUtils();
  const { mutate } = trpc.discovery.board.save.useMutation({
    scope: { id: BOARD_SAVE_SCOPE },
    onError: (error) => {
      void utils.discovery.board.get.invalidate();
      errorToast(error, "discovery.boardSaveFailed");
    },
  });

  return useCallback(
    (layout: BoardLayout) => {
      void utils.discovery.board.get.cancel();
      utils.discovery.board.get.setData(undefined, layout);
      mutate(layout);
    },
    [utils, mutate]
  );
}
