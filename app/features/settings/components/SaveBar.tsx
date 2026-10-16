"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { saveBar } from "../styles";
import { useSaveLabel, useSaveRegistry } from "./SettingsSaveScope";
import type { SaveBarProps } from "./types";

export function SaveBar({ isDirty, isSaving, saveDisabled, onSave, onCancel }: SaveBarProps) {
  const { t } = useTranslation("settings");
  const registry = useSaveRegistry();
  const label = useSaveLabel();
  const id = useId();
  const handlers = useRef({ onSave, onCancel });

  useEffect(() => {
    handlers.current = { onSave, onCancel };
  });

  useEffect(() => {
    registry?.register(id, {
      label,
      isDirty,
      isSaving,
      saveDisabled: Boolean(saveDisabled),
      save: () => handlers.current.onSave(),
      cancel: () => handlers.current.onCancel(),
    });
  }, [registry, id, label, isDirty, isSaving, saveDisabled]);

  useEffect(() => () => registry?.unregister(id), [registry, id]);

  if (registry) return null;
  if (!isDirty && !isSaving) return null;
  return (
    <div className={saveBar()}>
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
        {t("shell.saveBar.cancel")}
      </Button>
      <Button onClick={() => void onSave()} disabled={isSaving || Boolean(saveDisabled)} size="sm">
        {isSaving ? t("shell.saveBar.saving") : t("shell.saveBar.save")}
      </Button>
    </div>
  );
}
