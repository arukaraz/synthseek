"use client";

import { useContext, useState } from "react";

import { useWidgetData } from "@hooks/api/queries/widgets/useWidgetData";
import { useWidgetPreview } from "@hooks/api/queries/widgets/useWidgetPreview";
import { browserTimeZone } from "@utils/time-zone";

import { SmartListDialog } from "../SmartListDialog/SmartListDialog";
import { draftOf } from "../WidgetGallery/helpers";
import { StagedWidgetsContext } from "./context";
import { CustomWidgetContent } from "./CustomWidgetContent";
import type { CustomWidgetBodyProps } from "./types";

export function CustomWidgetBody({ widget, size }: CustomWidgetBodyProps) {
  const [timeZone] = useState(browserTimeZone);
  const staged = useContext(StagedWidgetsContext).has(widget.id);
  const saved = useWidgetData(widget, timeZone, !staged);
  const preview = useWidgetPreview(staged ? draftOf(widget) : null, timeZone);
  const { data, isLoading, isError } = staged ? preview : saved;
  const [openList, setOpenList] = useState<string | null>(null);

  return (
    <>
      <CustomWidgetContent
        widget={widget}
        size={size}
        result={data}
        isLoading={isLoading}
        isError={isError}
        onOpenList={setOpenList}
      />
      {openList === null || staged ? null : (
        <SmartListDialog
          widgetId={widget.id}
          slotId={openList}
          accent={widget.meta.accent}
          onClose={() => setOpenList(null)}
        />
      )}
    </>
  );
}
