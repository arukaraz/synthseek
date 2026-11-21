"use client";

import { THEME_CONTRACT } from "@theme/contract";
import { draftValues, fontFamilyOf, isFontFile, resetToken, setToken, tokenPathOf } from "@theme/custom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { useThemeFonts } from "@hooks/api/queries/theme";

import { appliedFontFiles } from "../../helpers";
import type { EditorModeProps } from "../../types";
import { ControlsHeader } from "./ControlsHeader";
import { SECTION_TOKENS, FONT_SANS, TYPOGRAPHY_SECTION } from "./constants";
import { FontList } from "./FontList";
import { FontUpload } from "./FontUpload";
import {
  changedNamesOf,
  copyOf,
  dirtySectionsOf,
  essentialsOf,
  fontStackOf,
  formatRatio,
  matchesQuery,
  unreadableOn,
} from "./helpers";
import { SectionNav } from "./SectionNav";
import { controlsColumn, editorLayout, emptyText, rowList, sectionsScroller } from "./styles";
import { TokenRow } from "./TokenRow";
import type { TokenCopy } from "./types";

export function VisualMode({ editor }: EditorModeProps) {
  const { t } = useTranslation("themeEditor");
  const { t: tTheme } = useTranslation("theme");
  const fonts = useThemeFonts(true);
  const [query, setQuery] = useState("");

  const editorRef = useRef(editor);
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const write = useCallback((name: string, value: string) => {
    const current = editorRef.current;
    current.change(setToken(current.draft, name, value));
  }, []);
  const reset = useCallback((name: string) => {
    const current = editorRef.current;
    current.change(resetToken(current.draft, name));
  }, []);
  const editInCss = useCallback((fileId: string) => {
    editorRef.current.setView({ mode: "css", file: tokenPathOf(fileId) });
  }, []);

  const copy: Record<string, TokenCopy> = tTheme("tokens", { returnObjects: true });
  const sectionLabels: Record<string, string> = tTheme("sections", { returnObjects: true });

  const { draft, saved, view } = editor;
  const values = useMemo(() => draftValues(draft), [draft]);
  const unreadable = useMemo(() => unreadableOn(values, THEME_CONTRACT.tokens), [values]);
  const dirtySections = useMemo(() => dirtySectionsOf(draft, saved, THEME_CONTRACT.tokens), [draft, saved]);
  const families = useMemo(() => appliedFontFiles(fonts.data).filter(isFontFile).map(fontFamilyOf), [fonts.data]);

  const section = SECTION_TOKENS.has(view.section) ? view.section : THEME_CONTRACT.files[0].id;
  const sectionTokens = SECTION_TOKENS.get(section) ?? [];
  const essentials = essentialsOf(sectionTokens);
  const needle = query.trim().toLowerCase();
  const searching = needle !== "";

  const matches = useMemo(
    () =>
      searching ? THEME_CONTRACT.tokens.filter((token) => matchesQuery(token, copyOf(copy, token.name), needle)) : [],
    [searching, needle, copy]
  );
  const listed = searching ? matches : view.showAll ? sectionTokens : essentials;
  const checked = searching ? matches : sectionTokens;
  const changed = useMemo(() => changedNamesOf(draft, checked), [draft, checked]);
  const hiddenChange =
    !searching &&
    !view.showAll &&
    sectionTokens.some((token) => !essentials.includes(token) && changed.has(token.name));
  const canExpand = sectionTokens.length > essentials.length;
  const presetName = t(`presets.${draft.meta.startedFrom}`);

  const sections = THEME_CONTRACT.files.map((file) => ({
    id: file.id,
    label: sectionLabels[file.id] ?? file.id,
    dirty: dirtySections.has(file.id),
  }));

  const applyFont = (file: string) => write(FONT_SANS, fontStackOf(FONT_SANS, fontFamilyOf(file)));

  return (
    <div className={editorLayout()}>
      <FadeScroll axis="x" className={sectionsScroller()}>
        <SectionNav sections={sections} current={section} onSelect={(id) => editor.setView({ section: id })} />
      </FadeScroll>
      <div className={controlsColumn()}>
        <ControlsHeader
          query={query}
          onQuery={setQuery}
          showToggle={!searching && (canExpand || view.showAll)}
          showAll={view.showAll}
          total={sectionTokens.length}
          hiddenChange={hiddenChange}
          onToggle={() => editor.setView({ showAll: !view.showAll })}
        />
        {listed.length === 0 ? (
          <p className={emptyText()}>{t("visual.noMatch")}</p>
        ) : (
          <div className={rowList()}>
            {listed.map((token) => {
              const tokenCopy = copyOf(copy, token.name);
              const pair = unreadable.get(token.name);
              const warning =
                pair === undefined
                  ? null
                  : t("visual.unreadable", { text: copyOf(copy, pair.text).label, ratio: formatRatio(pair.ratio) });
              return (
                <TokenRow
                  key={token.name}
                  token={token}
                  label={tokenCopy.label}
                  hint={tokenCopy.hint}
                  value={values.get(token.name) ?? ""}
                  other={token.on === undefined ? null : (values.get(token.on) ?? null)}
                  warning={warning}
                  following={draft.meta.follows.includes(token.name)}
                  changed={changed.has(token.name)}
                  presetName={presetName}
                  baseLabel={token.follows === undefined ? null : copyOf(copy, token.follows).label}
                  families={families}
                  onWrite={write}
                  onReset={reset}
                  onEditInCss={editInCss}
                />
              );
            })}
          </div>
        )}
        {section === TYPOGRAPHY_SECTION && !searching ? (
          <>
            <FontUpload fonts={fonts.data} />
            <FontList fonts={fonts.data} onUse={applyFont} />
          </>
        ) : null}
      </div>
    </div>
  );
}
