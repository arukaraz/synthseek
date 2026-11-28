"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { InlineError } from "@components/ui/InlineError";

import { saveBar } from "../styles";
import { useSaveLabel, useSaveRegistry } from "./SettingsSaveScope";
import type { SaveBarProps } from "./types";

export function SaveBar({ isDirty, isSaving, saveDisabled, onSave, onCancel }: SaveBarProps) {
  const { t } = useTranslation("settings");
  const registry = useSaveRegistry();
  const label = useSaveLabel();
  const id = useId();
  const handlers = useRef({ onSave, onCancel });
  const [failure, setFailure] = useState<unknown>(null);

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

  const save = async () => {
    setFailure(null);
    try {
      await onSave();
    } catch (error) {
      setFailure(error);
    }
  };

  const cancel = () => {
    setFailure(null);
    onCancel();
  };

  return (
    <>
      <InlineError error={failure} />
      <div className={saveBar()}>
        <Button variant="ghost" size="sm" onClick={cancel} disabled={isSaving}>
          {t("shell.saveBar.cancel")}
        </Button>
        <Button onClick={() => void save()} disabled={isSaving || Boolean(saveDisabled)} size="sm">
          {isSaving ? t("shell.saveBar.saving") : t("shell.saveBar.save")}
        </Button>
      </div>
    </>
  );
}
