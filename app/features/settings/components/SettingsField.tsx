"use client";

import { cn } from "@utils/cn";

import { fieldHelper, fieldLabel, fieldRow } from "../styles";
import type { SettingsFieldProps } from "./types";

export function SettingsField({ label, htmlFor, helper, className, children }: SettingsFieldProps) {
  return (
    <div className={cn(fieldRow(), className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={fieldLabel()}>
          {label}
        </label>
      ) : (
        <span className={fieldLabel()}>{label}</span>
      )}
      {children}
      {helper ? <p className={fieldHelper()}>{helper}</p> : null}
    </div>
  );
}
