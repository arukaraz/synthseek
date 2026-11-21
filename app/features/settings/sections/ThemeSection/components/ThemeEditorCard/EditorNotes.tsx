"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { lightSet } from "@theme/custom";
import { useThemeContext } from "@theme/ThemeProvider";
import { formatTimestamp } from "@utils/formatters";

import { schemeMismatchOf } from "./helpers";
import { noteRow, noteText, noteTitle, outlineButton } from "./styles";
import type { EditorNotesProps } from "./types";

export function EditorNotes({ editor, safeEdit }: EditorNotesProps) {
  const { t } = useTranslation("themeEditor");
  const { theme } = useThemeContext();
  const { draft, restoredAt } = editor;
  const mismatch = useMemo(() => schemeMismatchOf(draft), [draft]);

  const startLight = () => {
    editor.change(lightSet(draft));
    toast.success(t("notes.startedLightToast"));
  };

  const switchToLight = () => editor.change({ ...draft, meta: { ...draft.meta, scheme: "light" } });

  return (
    <>
      {restoredAt !== null ? (
        <div className={noteRow()} role="status">
          <p className={noteText()}>
            <span className={noteTitle()}>{t("notes.restoredTitle")}</span>{" "}
            {t("notes.restored", { time: formatTimestamp(new Date(restoredAt)) })}
          </p>
        </div>
      ) : null}
      {safeEdit && theme !== "custom" ? (
        <div className={noteRow()} role="status">
          <p className={noteText()}>
            <span className={noteTitle()}>{t("notes.safeEditTitle")}</span>{" "}
            {t("notes.safeEdit", { theme: t(`presets.${theme}`) })}
          </p>
        </div>
      ) : null}
      {mismatch === "lightOverDark" ? (
        <div className={noteRow()} role="status">
          <p className={noteText()}>{t("notes.lightOverDark")}</p>
          <Button size="sm" variant="ghost" className={outlineButton()} onClick={startLight}>
            {t("notes.startLight")}
          </Button>
        </div>
      ) : null}
      {mismatch === "darkOverLight" ? (
        <div className={noteRow()} role="status">
          <p className={noteText()}>{t("notes.darkOverLight")}</p>
          <Button size="sm" variant="ghost" className={outlineButton()} onClick={switchToLight}>
            {t("notes.switchToLight")}
          </Button>
        </div>
      ) : null}
    </>
  );
}
