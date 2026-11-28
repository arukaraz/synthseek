"use client";

import { useId } from "react";

import { cn } from "@utils/cn";

import { SettingsFieldLabelContext } from "../hooks/useSettingsFieldLabel";
import { fieldHelper, fieldLabel, fieldLabelRow, fieldRow } from "../styles";
import type { SettingsFieldProps } from "./types";

export function SettingsField({
  label,
  anchor,
  labelTrailing,
  htmlFor,
  helper,
  className,
  contentSpacing,
  children,
}: SettingsFieldProps) {
  const labelId = useId();
  const nameSource = htmlFor ? undefined : labelId;

  return (
    <SettingsFieldLabelContext.Provider value={nameSource ?? null}>
      <div className={cn(fieldRow({ spacing: contentSpacing }), className)} data-anchor-target={anchor}>
        {labelTrailing ? (
          <div className={fieldLabelRow()}>
            {htmlFor ? (
              <label htmlFor={htmlFor} className={fieldLabel()}>
                {label}
              </label>
            ) : (
              <span id={nameSource} className={fieldLabel()}>
                {label}
              </span>
            )}
            {labelTrailing}
          </div>
        ) : htmlFor ? (
          <label htmlFor={htmlFor} className={fieldLabel()}>
            {label}
          </label>
        ) : (
          <span id={nameSource} className={fieldLabel()}>
            {label}
          </span>
        )}
        {children}
        {helper ? <p className={fieldHelper()}>{helper}</p> : null}
      </div>
    </SettingsFieldLabelContext.Provider>
  );
}
