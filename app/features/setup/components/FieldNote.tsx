import { fieldError, fieldHint } from "../styles";
import type { FieldNoteProps } from "../types";

export function FieldNote({ id, tone, children }: FieldNoteProps) {
  return (
    <p id={id} role={tone === "error" ? "alert" : undefined} className={tone === "error" ? fieldError() : fieldHint()}>
      {children}
    </p>
  );
}
