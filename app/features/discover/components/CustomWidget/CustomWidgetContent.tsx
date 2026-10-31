"use client";

import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";

import { useWidgetControls } from "../../hooks/useWidgetControls";
import { BLOCK_COMPONENTS, FRAMELESS_BLOCKS } from "./constants";
import {
  customWidgetNote,
  setHiddenNote,
  setStatusOf,
  viewIsEmpty,
  widgetIconOf,
  widgetViewOf,
  withListOpening,
} from "./helpers";
import { framelessBlock, setHiddenLine } from "./styles";
import type { CustomWidgetContentProps } from "./types";

export function CustomWidgetContent({
  widget,
  size,
  result,
  isLoading,
  isError,
  onOpenList,
}: CustomWidgetContentProps) {
  const { t } = useTranslation("discover");
  const titleId = useId();
  const itemActions = useWidgetControls(widget.view.action);
  const controls = useMemo(() => withListOpening(itemActions, onOpenList), [itemActions, onOpenList]);
  const Block = BLOCK_COMPONENTS[widget.view.block];
  const view = useMemo(() => widgetViewOf(result, widget.view.bind), [result, widget.view.bind]);
  const note = customWidgetNote({ result, isError, empty: viewIsEmpty(view) });
  const icon = widgetIconOf(widget.meta.icon);
  const blockProps = {
    ...view,
    size,
    accent: widget.meta.accent,
    controls,
    heading: { name: widget.meta.name, description: widget.meta.description, icon },
  };

  const hidden = setHiddenNote(result);
  const framed = result?.type === "playlists";

  if (FRAMELESS_BLOCKS.has(widget.view.block) && !isLoading && note === null && !framed) {
    return (
      <div className={framelessBlock()}>
        <Block {...blockProps} />
      </div>
    );
  }

  return (
    <WidgetFrame
      icon={icon}
      title={widget.meta.name}
      subtitle={setStatusOf(result) ?? widget.meta.description}
      info={t("customWidget.info")}
      titleId={titleId}
      loading={isLoading}
      note={note}
    >
      <Block {...blockProps} />
      {hidden ? <p className={setHiddenLine()}>{hidden}</p> : null}
    </WidgetFrame>
  );
}
