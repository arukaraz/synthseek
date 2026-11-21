"use client";

import {
  themePreviewBar,
  themePreviewBody,
  themePreviewChip,
  themePreviewRail,
  themePreviewRailBar,
  themePreviewWindow,
} from "./styles";

export function ThemePreviewWindow() {
  return (
    <div className={themePreviewWindow()}>
      <div className={themePreviewRail()}>
        <span className={themePreviewRailBar({ active: true })} />
        <span className={themePreviewRailBar()} />
        <span className={themePreviewRailBar()} />
      </div>
      <div className={themePreviewBody()}>
        <span className={themePreviewBar({ line: "title" })} />
        <span className={themePreviewBar({ line: "text" })} />
        <span className={themePreviewBar({ line: "hint" })} />
        <span className={themePreviewChip()} />
      </div>
    </div>
  );
}
