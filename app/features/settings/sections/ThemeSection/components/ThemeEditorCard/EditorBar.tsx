"use client";

import { Eye, Redo2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import type { ThemeDraft } from "@theme/custom";

import { PREVIEW_PATH, SAVED_TOAST_OPTIONS } from "./constants";
import { barStatusOf, canSaveTheme } from "./helpers";
import { barPreview, barSeparator, barStatus, editorBar, outlineButton } from "./styles";
import { TipIconButton } from "./TipIconButton";
import type { EditorBarProps } from "./types";

export function EditorBar({ editor }: EditorBarProps) {
  const { t } = useTranslation("themeEditor");
  const router = useRouter();
  const requestedFrom = useRef<ThemeDraft | null>(null);
  const { saving, saved } = editor;
  const status = barStatusOf(editor);

  useEffect(() => {
    if (saving || requestedFrom.current === null) return;
    if (saved !== requestedFrom.current) toast.success(t("bar.savedToast"), SAVED_TOAST_OPTIONS);
    requestedFrom.current = null;
  }, [saving, saved, t]);

  const save = () => {
    requestedFrom.current = saved;
    editor.save();
  };

  const discard = () => {
    editor.discard();
    toast.success(t("bar.discardedToast"));
  };

  const preview = () => {
    editor.startPreview();
    router.push(PREVIEW_PATH);
  };

  return (
    <div role="toolbar" aria-label={t("bar.label")} className={editorBar()}>
      <TipIconButton
        icon={Undo2}
        variant="ghost"
        size="lg"
        label={t("bar.undo")}
        disabled={!editor.canUndo}
        onClick={editor.undo}
      />
      <TipIconButton
        icon={Redo2}
        variant="ghost"
        size="lg"
        label={t("bar.redo")}
        disabled={!editor.canRedo}
        onClick={editor.redo}
      />
      <span className={barSeparator()} aria-hidden />
      <p className={barStatus()} role="status">
        {status.kind === "broken" ? (
          <>
            <strong>{t("bar.saveOff")}</strong>{" "}
            {status.others === 0
              ? t("bar.fixOne", { file: status.file })
              : t("bar.fixMore", { file: status.file, count: status.others })}
          </>
        ) : null}
        {status.kind === "saving" ? t("bar.saving") : null}
        {status.kind === "unsaved" ? t("bar.unsaved") : null}
        {status.kind === "saved" ? t("bar.saved") : null}
      </p>
      <TipIconButton
        icon={Eye}
        variant="ghost"
        size="lg"
        label={t("bar.preview")}
        className={barPreview()}
        onClick={preview}
      />
      <Button size="sm" variant="ghost" className={outlineButton()} disabled={!editor.dirty} onClick={discard}>
        {t("bar.discard")}
      </Button>
      <Button size="sm" aria-label={t("bar.saveTheme")} disabled={!canSaveTheme(editor)} onClick={save}>
        <span className="sm:hidden">{t("bar.save")}</span>
        <span className="max-sm:hidden">{t("bar.saveTheme")}</span>
      </Button>
    </div>
  );
}
