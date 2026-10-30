"use client";

import { BOARD_WIDGETS } from "../ExploreBoard/constants";
import { previewFrame } from "./helpers";
import { ScaledPreview } from "./ScaledPreview";
import type { WidgetPreviewProps } from "./types";

export function WidgetPreview({ widget }: WidgetPreviewProps) {
  const definition = BOARD_WIDGETS[widget];
  const Widget = definition.component;

  return (
    <ScaledPreview frame={previewFrame(widget)}>
      <Widget size={definition.defaultSize} info="" />
    </ScaledPreview>
  );
}
