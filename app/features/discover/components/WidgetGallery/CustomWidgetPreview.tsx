"use client";

import { CustomWidgetBody } from "../CustomWidget/CustomWidgetBody";
import { lockedBlockSize } from "../ExploreBoard/helpers";
import { customPreviewFrame } from "./helpers";
import { ScaledPreview } from "./ScaledPreview";
import type { CustomWidgetPreviewProps } from "./types";

export function CustomWidgetPreview({ widget }: CustomWidgetPreviewProps) {
  const size = lockedBlockSize(widget.view.block) ?? widget.defaultSize;
  return (
    <ScaledPreview frame={customPreviewFrame(widget.view.block, size)}>
      <CustomWidgetBody widget={widget} size={size} />
    </ScaledPreview>
  );
}
