"use client";

import { useState } from "react";

import { useWidgetData } from "@hooks/api/queries/widgets/useWidgetData";
import { browserTimeZone } from "@utils/time-zone";

import { CustomWidgetContent } from "./CustomWidgetContent";
import type { CustomWidgetBodyProps } from "./types";

export function CustomWidgetBody({ widget, size }: CustomWidgetBodyProps) {
  const [timeZone] = useState(browserTimeZone);
  const { data, isLoading, isError } = useWidgetData(widget.id, timeZone);

  return <CustomWidgetContent widget={widget} size={size} result={data} isLoading={isLoading} isError={isError} />;
}
