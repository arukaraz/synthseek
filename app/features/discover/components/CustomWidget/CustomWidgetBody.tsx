"use client";

import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { useWidgetData } from "@hooks/api/queries/widgets/useWidgetData";
import { browserTimeZone } from "@utils/time-zone";

import { useWidgetControls } from "../../hooks/useWidgetControls";
import { BLOCK_COMPONENTS } from "./constants";
import { customWidgetNote, widgetIconOf, widgetItemsOf, widgetStatsOf } from "./helpers";
import type { CustomWidgetBodyProps } from "./types";

export function CustomWidgetBody({ widget, size }: CustomWidgetBodyProps) {
  const { t } = useTranslation("discover");
  const titleId = useId();
  const [timeZone] = useState(browserTimeZone);
  const { data, isLoading, isError } = useWidgetData(widget.id, timeZone);
  const controls = useWidgetControls(widget.view.action);
  const Block = BLOCK_COMPONENTS[widget.view.block];
  const items = useMemo(() => (data ? widgetItemsOf(data, widget.view.bind) : []), [data, widget.view.bind]);
  const stats = useMemo(() => (data ? widgetStatsOf(data) : []), [data]);
  const note = customWidgetNote({ result: data, isError, empty: items.length === 0, supported: Block !== undefined });

  return (
    <WidgetFrame
      icon={widgetIconOf(widget.meta.icon)}
      title={widget.meta.name}
      subtitle={widget.meta.description}
      info={t("customWidget.info")}
      titleId={titleId}
      loading={Block !== undefined && isLoading}
      note={note}
    >
      {Block ? <Block items={items} stats={stats} size={size} accent={widget.meta.accent} controls={controls} /> : null}
    </WidgetFrame>
  );
}
