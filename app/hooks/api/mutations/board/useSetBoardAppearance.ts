import { useCallback } from "react";

import type { BoardAppearance } from "@hooks/api/queries/board/types";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import type { BoardWriteMode } from "./types";

export function useSetBoardAppearance(): (appearance: BoardAppearance, mode?: BoardWriteMode) => Promise<boolean> {
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.discovery.board.setAppearance.useMutation({
    onError: (error) => {
      void utils.discovery.board.appearance.invalidate();
      errorToast(error, "discovery.appearanceSaveFailed");
    },
  });

  return useCallback(
    (appearance: BoardAppearance, mode: BoardWriteMode = "optimistic") => {
      if (mode === "optimistic") {
        void utils.discovery.board.appearance.cancel();
        utils.discovery.board.appearance.setData(undefined, appearance);
      }
      return mutateAsync(appearance).then(
        (saved) => {
          if (mode === "confirmed") utils.discovery.board.appearance.setData(undefined, saved);
          return true;
        },
        () => false
      );
    },
    [utils, mutateAsync]
  );
}
