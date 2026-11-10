import { useCallback } from "react";

import type { BoardLayout } from "@hooks/api/queries/board/types";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { BOARD_SAVE_SCOPE } from "./constants";
import type { BoardWriteMode } from "./types";

export function useSaveBoardLayout(): (layout: BoardLayout, mode?: BoardWriteMode) => Promise<boolean> {
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.discovery.board.save.useMutation({
    scope: { id: BOARD_SAVE_SCOPE },
    onError: (error) => {
      void utils.discovery.board.get.invalidate();
      errorToast(error, "discovery.boardSaveFailed");
    },
  });

  return useCallback(
    (layout: BoardLayout, mode: BoardWriteMode = "optimistic") => {
      if (mode === "optimistic") {
        void utils.discovery.board.get.cancel();
        utils.discovery.board.get.setData(undefined, layout);
      }
      return mutateAsync(layout).then(
        (saved) => {
          if (mode === "confirmed") utils.discovery.board.get.setData(undefined, saved);
          return true;
        },
        () => false
      );
    },
    [utils, mutateAsync]
  );
}
