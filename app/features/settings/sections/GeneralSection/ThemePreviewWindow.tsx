"use client";

import {
  themePreviewBar,
  themePreviewBarRow,
  themePreviewBody,
  themePreviewChip,
  themePreviewRail,
  themePreviewRailDot,
  themePreviewWindow,
} from "./styles";

export function ThemePreviewWindow() {
  return (
    <div className={themePreviewWindow()}>
      <div className={themePreviewRail()}>
        <span className={themePreviewRailDot()} />
        <span className={themePreviewRailDot()} />
        <span className={themePreviewRailDot()} />
      </div>
      <div className={themePreviewBody()}>
        <div className={themePreviewBarRow()}>
          <span className={themePreviewBar({ strength: "strong", width: "wide" })} />
          <span className={themePreviewBar({ strength: "medium", width: "full" })} />
          <span className={themePreviewBar({ strength: "faint", width: "narrow" })} />
        </div>
        <span className={themePreviewChip()} />
      </div>
    </div>
  );
}
