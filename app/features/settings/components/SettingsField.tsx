"use client";

import type { ReactNode } from "react";

import { cn } from "@utils/cn";

import { fieldHelper, fieldLabel, fieldRow } from "../styles";

interface SettingsFieldProps {
  label: string;
  helper?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SettingsField({ label, helper, className, children }: SettingsFieldProps) {
  return (
    <div className={cn(fieldRow(), className)}>
      <span className={fieldLabel()}>{label}</span>
      {children}
      {helper ? <p className={fieldHelper()}>{helper}</p> : null}
    </div>
  );
}
