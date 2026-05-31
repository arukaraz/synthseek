"use client";

import { ShieldAlert } from "lucide-react";

import { contentRoot, emptyPanel } from "../styles";
import { SettingsPageHeader } from "./SettingsPageHeader";

export function SettingsAccessDenied() {
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="Restricted" />
      <div className={emptyPanel()}>
        <ShieldAlert className="text-fg/40 size-6" />
        <span className="text-fg/60 text-sm">Only administrators can access this section.</span>
      </div>
    </div>
  );
}
