"use client";

import { useCallback, useMemo, useState } from "react";

import type { BoardAppearance, BoardItem, BoardList, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";

import type { CustomizationDraft, UseCustomizationDraftOptions } from "../components/BoardCustomization/types";
import { sameAppearance, withStagedWidgets } from "../components/BoardSettings/helpers";
import type { StagedTemplate } from "../components/BoardSettings/types";
import {
  appendCustomWidget,
  appendWidget,
  boardBackgroundOf,
  removeItem,
  uniqueTileId,
  widgetsOnBoard,
} from "../components/ExploreBoard/helpers";
import { useBoardArrange } from "./useBoardArrange";

export function useCustomizationDraft({ lists, appearance, custom }: UseCustomizationDraftOptions): CustomizationDraft {
  const [styled, setStyled] = useState<BoardAppearance | null>(null);
  const [staged, setStaged] = useState<StagedTemplate | null>(null);
  const documents = staged?.template.documents;
  const previewCustom = useMemo(() => withStagedWidgets(custom, documents ?? []), [custom, documents]);
  const stagedIds = useMemo(() => new Set((documents ?? []).map((widget) => widget.id)), [documents]);
  const desktop = useBoardArrange({ items: lists.items, custom: previewCustom });
  const mobile = useBoardArrange({ items: lists.mobile, custom: previewCustom });
  const draft = useMemo(() => ({ items: desktop.draft, mobile: mobile.draft }), [desktop.draft, mobile.draft]);
  const { update: updateDesktop, replace: replaceDesktop, setBackgrounds: backgroundsDesktop } = desktop;
  const { update: updateMobile, replace: replaceMobile, setBackgrounds: backgroundsMobile } = mobile;

  const restyled = styled !== null && appearance !== undefined && !sameAppearance(styled, appearance);
  const rearranged = desktop.dirty || mobile.dirty;

  const updateLists = useCallback(
    (targets: readonly BoardList[], change: (current: BoardItem[]) => BoardItem[]) => {
      if (targets.includes("items")) updateDesktop(change);
      if (targets.includes("mobile")) updateMobile(change);
    },
    [updateDesktop, updateMobile]
  );

  const addWidget = useCallback(
    (widget: BoardWidgetKey, targets: readonly BoardList[]) =>
      updateLists(targets, (current) =>
        widgetsOnBoard(current).has(widget) ? current : appendWidget(current, widget, uniqueTileId(widget, current))
      ),
    [updateLists]
  );
  const removeWidget = useCallback(
    (widget: BoardWidgetKey, targets: readonly BoardList[]) =>
      updateLists(targets, (current) => {
        const id = widgetsOnBoard(current).get(widget);
        return id ? removeItem(current, id) : current;
      }),
    [updateLists]
  );
  const addCustom = useCallback(
    (widget: WidgetDocument, targets: readonly BoardList[]) =>
      updateLists(targets, (current) => appendCustomWidget(current, widget)),
    [updateLists]
  );
  const dropCustom = useCallback(
    (widgetId: string) =>
      updateLists(["items", "mobile"], (current) =>
        current.filter((item) => item.kind !== "custom" || item.widgetId !== widgetId)
      ),
    [updateLists]
  );
  const setBackgrounds = useCallback(
    (shown: boolean) => {
      backgroundsDesktop(shown);
      backgroundsMobile(shown);
    },
    [backgroundsDesktop, backgroundsMobile]
  );

  const stage = useCallback(
    (next: StagedTemplate) => {
      setStaged(next);
      setStyled(next.template.appearance);
      replaceDesktop(next.template.layout.items);
      replaceMobile(next.template.layout.mobile);
    },
    [replaceDesktop, replaceMobile]
  );
  const unstage = useCallback(() => {
    setStaged(null);
    setStyled(null);
    replaceDesktop(lists.items);
    replaceMobile(lists.mobile);
  }, [replaceDesktop, replaceMobile, lists]);

  return {
    arranges: { items: desktop, mobile },
    draft,
    previewCustom,
    stagedIds,
    staged,
    styled,
    shownAppearance: styled ?? appearance,
    restyled,
    rearranged,
    dirty: rearranged || restyled || staged !== null,
    background: boardBackgroundOf([...desktop.draft, ...mobile.draft]),
    setStyled,
    setBackgrounds,
    addWidget,
    removeWidget,
    addCustom,
    dropCustom,
    stage,
    unstage,
  };
}
