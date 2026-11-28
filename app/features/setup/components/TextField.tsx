"use client";

import { useId } from "react";

import { authFieldLabel, authInputControl, authInputIcon, authInputRow } from "@components/ui/styles";

import { fieldGroup } from "../styles";
import type { TextFieldProps } from "../types";
import { FieldNote } from "./FieldNote";

export function TextField({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  autoComplete,
  placeholder,
  hint,
  error,
  inputRef,
  id,
  minLength,
  maxLength,
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const noteId = `${inputId}-note`;
  const note = error ?? hint ?? null;

  return (
    <div className={fieldGroup()}>
      <label htmlFor={inputId} className={authFieldLabel()}>
        {label}
      </label>
      <div className={authInputRow({ invalid: Boolean(error) })}>
        <Icon className={authInputIcon()} aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoCapitalize="off"
          spellCheck={false}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          className={authInputControl()}
        />
      </div>
      {note ? (
        <FieldNote id={noteId} tone={error ? "error" : "hint"}>
          {note}
        </FieldNote>
      ) : null}
    </div>
  );
}
