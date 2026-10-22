"use client";

import { BOARD_WIDGETS } from "../ExploreBoard/constants";
import { previewFrame } from "./helpers";
import { previewFit, previewStage, previewVars } from "./styles";
import type { WidgetPreviewProps } from "./types";

export function WidgetPreview({ widget, info }: WidgetPreviewProps) {
  const definition = BOARD_WIDGETS[widget];
  const Widget = definition.component;
  const frame = previewFrame(widget);

  return (
    <div className={previewFit()} style={previewVars(frame)} aria-hidden inert>
      <div className={previewStage()}>
        <Widget size={definition.defaultSize} info={info} />
      </div>
    </div>
  );
}
