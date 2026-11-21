"use client";

import { useCodeEditor } from "../hooks/useCodeEditor";
import { codeHost } from "../styles";
import type { CodeEditorProps } from "../types";

export function CodeEditor(props: CodeEditorProps) {
  const host = useCodeEditor(props);
  return <div ref={host} className={codeHost()} />;
}
