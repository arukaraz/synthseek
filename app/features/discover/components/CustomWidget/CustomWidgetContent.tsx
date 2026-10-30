"use client";

import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";

import { useWidgetControls } from "../../hooks/useWidgetControls";
import { BLOCK_COMPONENTS } from "./constants";
import { customWidgetNote, viewIsEmpty, widgetIconOf, widgetViewOf } from "./helpers";
import type { CustomWidgetContentProps } from "./types";

export function CustomWidgetContent({ widget, size, result, isLoading, isError }: CustomWidgetContentProps) {
  const { t } = useTranslation("discover");
  const titleId = useId();
  const controls = useWidgetControls(widget.view.action);
  const Block = BLOCK_COMPONENTS[widget.view.block];
  const view = useMemo(() => widgetViewOf(result, widget.view.bind), [result, widget.view.bind]);
  const note = customWidgetNote({ result, isError, empty: viewIsEmpty(view) });

  return (
    <WidgetFrame
      icon={widgetIconOf(widget.meta.icon)}
      title={widget.meta.name}
      subtitle={widget.meta.description}
      info={t("customWidget.info")}
      titleId={titleId}
      loading={isLoading}
      note={note}
    >
      <Block {...view} size={size} accent={widget.meta.accent} controls={controls} />
    </WidgetFrame>
  );
}
