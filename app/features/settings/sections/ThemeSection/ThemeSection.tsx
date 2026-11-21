"use client";

import { useUrlParam } from "@hooks/ui/useUrlParam";
import { useThemeContext } from "@theme/ThemeProvider";

import { ThemeEditorCard } from "./components/ThemeEditorCard";
import { ThemePicker } from "./components/ThemePicker";
import { EDIT_PARAM } from "./constants";

export function ThemeSection() {
  const { theme, custom } = useThemeContext();
  const [editParam] = useUrlParam(EDIT_PARAM);
  const safeEdit = editParam !== undefined;
  const editing = custom !== null && (theme === "custom" || safeEdit);

  return (
    <>
      <ThemePicker editing={editing} />
      {editing ? <ThemeEditorCard safeEdit={safeEdit} /> : null}
    </>
  );
}
