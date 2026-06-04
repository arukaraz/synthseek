"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { saveBar } from "../styles";
import type { SaveBarProps } from "./types";

export function SaveBar({ isDirty, isSaving, saveDisabled, onSave, onCancel }: SaveBarProps) {
  const { t } = useTranslation("settings");
  if (!isDirty && !isSaving) return null;
  return (
    <div className={saveBar()}>
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
        {t("shell.saveBar.cancel")}
      </Button>
      <Button onClick={onSave} disabled={isSaving || Boolean(saveDisabled)} size="sm">
        {isSaving ? t("shell.saveBar.saving") : t("shell.saveBar.save")}
      </Button>
    </div>
  );
}
