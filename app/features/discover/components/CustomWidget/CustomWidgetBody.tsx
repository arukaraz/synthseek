"use client";

import { useState } from "react";

import { useWidgetData } from "@hooks/api/queries/widgets/useWidgetData";
import { browserTimeZone } from "@utils/time-zone";

import { SmartListDialog } from "../SmartListDialog/SmartListDialog";
import { CustomWidgetContent } from "./CustomWidgetContent";
import type { CustomWidgetBodyProps } from "./types";

export function CustomWidgetBody({ widget, size }: CustomWidgetBodyProps) {
  const [timeZone] = useState(browserTimeZone);
  const { data, isLoading, isError } = useWidgetData(widget.id, timeZone);
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
      {openList === null ? null : (
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
