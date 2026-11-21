"use client";

import { useState } from "react";

import type { CheckedFile, ThemeDiagnostic } from "../../../types";
import { EMPTY_DIAGNOSTICS } from "../constants";
import type { HeldDiagnostics } from "../types";

export function useHeldDiagnostics(file: string, text: string, entry: CheckedFile | undefined): ThemeDiagnostic[] {
  const fresh = entry !== undefined && entry.text === text ? entry.diagnostics : null;
  const [held, setHeld] = useState<HeldDiagnostics>({ file, diagnostics: fresh ?? EMPTY_DIAGNOSTICS });
  if (fresh !== null && (held.file !== file || held.diagnostics !== fresh)) {
    setHeld({ file, diagnostics: fresh });
  }
  if (fresh !== null) return fresh;
  return held.file === file ? held.diagnostics : EMPTY_DIAGNOSTICS;
}
