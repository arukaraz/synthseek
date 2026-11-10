"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { SaveBar } from "@features/settings/components/SaveBar";
import { useApplyBoardTemplate } from "@hooks/api/mutations/board/useApplyBoardTemplate";
import type { BoardList } from "@hooks/api/queries/board/types";

import { useBoardSave } from "../../hooks/useBoardSave";
import { useCustomizationDraft } from "../../hooks/useCustomizationDraft";
import { BOARD_DEVICE_OF, BOARD_LIST_OF } from "../ExploreBoard/constants";
import { BoardSection } from "./BoardSection";
import { PREVIEW_BOARD_WIDTH_PX } from "./constants";
import { BoardNotSavedError } from "./helpers";
import type { BoardSettingsFormProps, BoardSettingsTab, PendingTemplate, StageTemplate } from "./types";

export function BoardSettingsForm({ lists, device, appearance, custom, customStatus }: BoardSettingsFormProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const [list, setList] = useState<BoardList>(BOARD_LIST_OF[device]);
  const [tab, setTab] = useState<BoardSettingsTab>("appearance");
  const [pendingTemplate, setPendingTemplate] = useState<PendingTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const draft = useCustomizationDraft({ lists, appearance, custom });
  const applyTemplate = useApplyBoardTemplate();
  const board = useBoardSave(lists);

  const stage: StageTemplate = (json, template) => {
    const run = () => draft.stage({ json, template });
    if (draft.dirty) setPendingTemplate({ stage: run });
    else run();
  };
  const stageConfirmed = () => {
    setPendingTemplate(null);
    pendingTemplate?.stage();
  };
  const save = async () => {
    if (draft.staged) {
      const applied = await applyTemplate.mutateAsync({
        json: draft.staged.json,
        layout: draft.draft,
        appearance: draft.styled ?? undefined,
      });
      draft.unstage();
      board.templateApplied(applied);
      return;
    }
    setSaving(true);
    try {
      const saved = await board.saveChanges(
        {
          lists: draft.rearranged ? draft.draft : null,
          appearance:
            draft.restyled && draft.styled && appearance ? { next: draft.styled, previous: appearance } : null,
        },
        "confirmed"
      );
      if (!saved) throw new BoardNotSavedError();
      draft.settle();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <BoardSection
        draft={draft}
        saved={lists}
        list={list}
        onListChange={setList}
        tab={tab}
        onTabChange={setTab}
        boardWidth={PREVIEW_BOARD_WIDTH_PX[BOARD_DEVICE_OF[list]]}
        customStatus={customStatus}
        onStage={stage}
      />
      <SaveBar
        isDirty={draft.dirty}
        isSaving={applyTemplate.isPending || saving}
        onSave={save}
        onCancel={draft.unstage}
      />
      <ConfirmationModal
        isOpen={pendingTemplate !== null}
        onClose={() => setPendingTemplate(null)}
        onConfirm={stageConfirmed}
        title={t("board.arrange.discard.title")}
        message={t("widgets:board.settings.discardForTemplate")}
        confirmText={t("widgets:board.templates.apply")}
        cancelText={t("board.arrange.discard.keep")}
        variant="warning"
      />
    </>
  );
}
