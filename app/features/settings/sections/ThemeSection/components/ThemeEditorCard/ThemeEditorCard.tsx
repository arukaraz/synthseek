"use client";

import { useTranslation } from "react-i18next";

import { SectionLoading } from "@components/ui/SectionLoading";
import { settingsCard } from "@features/settings/styles";

import { useThemeEditor } from "../../hooks/useThemeEditor";
import { EditorFrame } from "./EditorFrame";
import { editorTitle } from "./styles";
import type { ThemeEditorCardProps } from "./types";

export function ThemeEditorCard({ safeEdit }: ThemeEditorCardProps) {
  const { t } = useTranslation("themeEditor");
  const editor = useThemeEditor();

  if (editor === null) {
    return (
      <section className={settingsCard()} data-part="card" aria-busy>
        <h2 className={editorTitle()}>{t("editor.title")}</h2>
        <SectionLoading message={t("editor.loading")} />
      </section>
    );
  }

  return <EditorFrame editor={editor} safeEdit={safeEdit} />;
}
