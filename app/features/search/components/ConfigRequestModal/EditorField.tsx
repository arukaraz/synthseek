"use client";

import { editorField, editorHelp, editorLabel } from "./styles";
import type { EditorFieldProps } from "./types";

export function EditorField({ label, help, children }: EditorFieldProps) {
  return (
    <div className={editorField()}>
      <span className={editorLabel()}>{label}</span>
      {children}
      {help ? <span className={editorHelp()}>{help}</span> : null}
    </div>
  );
}
