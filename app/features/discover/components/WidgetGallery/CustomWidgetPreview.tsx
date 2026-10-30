"use client";

import { CustomWidgetBody } from "../CustomWidget/CustomWidgetBody";
import { customPreviewFrame } from "./helpers";
import { ScaledPreview } from "./ScaledPreview";
import type { CustomWidgetPreviewProps } from "./types";

export function CustomWidgetPreview({ widget }: CustomWidgetPreviewProps) {
  return (
    <ScaledPreview frame={customPreviewFrame(widget.view.block, widget.defaultSize)}>
      <CustomWidgetBody widget={widget} size={widget.defaultSize} />
    </ScaledPreview>
  );
}
