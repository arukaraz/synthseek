"use client";

import { cn } from "@utils/cn";

import { fieldHelper, fieldLabel, fieldRow } from "../styles";
import type { SettingsFieldProps } from "./types";

export function SettingsField({ label, helper, className, children }: SettingsFieldProps) {
  return (
    <div className={cn(fieldRow(), className)}>
      <span className={fieldLabel()}>{label}</span>
      {children}
      {helper ? <p className={fieldHelper()}>{helper}</p> : null}
    </div>
  );
}
