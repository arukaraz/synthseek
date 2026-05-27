"use client";

import { contentRoot, emptyPanel } from "../styles";
import { SettingsPageHeader } from "./SettingsPageHeader";
import type { SettingsPagePlaceholderProps } from "./types";

export function SettingsPagePlaceholder({ title, message }: SettingsPagePlaceholderProps) {
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={title} />
      <div className={emptyPanel()}>
        <span className="text-fg/60 text-sm">{message ?? "Coming soon."}</span>
      </div>
    </div>
  );
}
