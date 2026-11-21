"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";
import { settingsCard } from "@features/settings/styles";

import { SharePanel } from "../SharePanel";
import type { SharePanelKind } from "../SharePanel";
import { VisualMode } from "../VisualMode/VisualMode";
import { THEME_DOCS_URL } from "../../constants";
import { EditorBar } from "./EditorBar";
import { EditorMenu } from "./EditorMenu";
import { EditorNotes } from "./EditorNotes";
import { isOwnUndoField, isUndoShortcut } from "./helpers";
import { LazyCssMode } from "./LazyCssMode";
import { docLink, editorBody, editorContent, editorControls, editorHeader, editorTitle } from "./styles";
import type { EditorFrameProps } from "./types";
import type { EditorMode } from "../../types";

export function EditorFrame({ editor, safeEdit }: EditorFrameProps) {
  const { t } = useTranslation("themeEditor");
  const titleId = useId();
  const [panel, setPanel] = useState<SharePanelKind | null>(null);

  const modeOptions: { value: EditorMode; label: string }[] = [
    { value: "visual", label: t("editor.visual") },
    { value: "css", label: t("editor.css") },
  ];

  const { undo } = editor;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isUndoShortcut(event) || isOwnUndoField(event.target)) return;
      event.preventDefault();
      undo();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  return (
    <section className={settingsCard()} data-part="card" aria-labelledby={titleId}>
      <header className={editorHeader()}>
        <h2 id={titleId} className={editorTitle()}>
          {t("editor.title")}
        </h2>
        <a className={docLink()} href={THEME_DOCS_URL} target="_blank" rel="noopener">
          <BookOpen className="size-4 shrink-0" aria-hidden />
          <span className="max-sm:sr-only">{t("editor.reference")}</span>
          <ExternalLink className="size-3.5 shrink-0 max-sm:hidden" aria-hidden />
        </a>
        <div className={editorControls()}>
          <SegmentedControl<EditorMode>
            value={editor.view.mode}
            options={modeOptions}
            onChange={(mode) => editor.setView({ mode })}
            ariaLabel={t("editor.modeLabel")}
          />
          <EditorMenu editor={editor} panel={panel} onShare={setPanel} />
        </div>
      </header>
      <div className={editorBody()}>
        <div className={editorContent()}>
          {panel !== null ? <SharePanel kind={panel} editor={editor} onClose={() => setPanel(null)} /> : null}
          <EditorNotes editor={editor} safeEdit={safeEdit} />
          {editor.view.mode === "visual" ? <VisualMode editor={editor} /> : <LazyCssMode editor={editor} />}
        </div>
        <EditorBar editor={editor} />
      </div>
    </section>
  );
}
