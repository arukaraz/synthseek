"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { TOAST_ACTION_DURATION_MS } from "@components/ui/Toaster/constants";
import type { BoardWriteMode } from "@hooks/api/mutations/board/types";
import { useSaveBoardLayout } from "@hooks/api/mutations/board/useSaveBoardLayout";
import { useSetBoardAppearance } from "@hooks/api/mutations/board/useSetBoardAppearance";
import { useUndoBoardTemplate } from "@hooks/api/mutations/board/useUndoBoardTemplate";
import type { BoardLists, BoardTemplateApplied } from "@hooks/api/queries/board/types";

import { layoutOf } from "../components/ExploreBoard/helpers";
import type { BoardSave, BoardSaver } from "../components/ExploreBoard/types";

export function useBoardSave(lists: BoardLists): BoardSaver {
  const { t } = useTranslation(["discover", "widgets"]);
  const save = useSaveBoardLayout();
  const setAppearance = useSetBoardAppearance();
  const undoTemplate = useUndoBoardTemplate();

  const offerUndo = useCallback(
    ({ lists: next, appearance }: BoardSave) => {
      toast.success(t("board.toast.saved"), {
        duration: TOAST_ACTION_DURATION_MS,
        action: {
          label: t("board.toast.undo"),
          onClick: () => {
            if (next) void save(layoutOf(lists));
            if (appearance) void setAppearance(appearance.previous);
          },
        },
      });
    },
    [lists, save, setAppearance, t]
  );

  const saveChanges = useCallback(
    async (changes: BoardSave, mode: BoardWriteMode = "optimistic") => {
      const { lists: next, appearance } = changes;
      const writes = [
        next ? save(layoutOf(next), mode) : null,
        appearance ? setAppearance(appearance.next, mode) : null,
      ].filter((write) => write !== null);
      if (writes.length === 0) return true;
      if (mode === "optimistic") offerUndo(changes);
      const saved = (await Promise.all(writes)).every(Boolean);
      if (mode === "confirmed" && saved) offerUndo(changes);
      return saved;
    },
    [offerUndo, save, setAppearance]
  );

  const templateApplied = useCallback(
    (applied: BoardTemplateApplied) => {
      toast.success(t("widgets:board.templates.applied"), {
        duration: TOAST_ACTION_DURATION_MS,
        action: {
          label: t("widgets:board.templates.undo"),
          onClick: () =>
            undoTemplate.mutate(applied.undo, {
              onSuccess: () => toast.success(t("widgets:board.templates.undone")),
            }),
        },
      });
    },
    [t, undoTemplate]
  );

  return { saveChanges, templateApplied };
}
