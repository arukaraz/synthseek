"use client";

import { Button } from "@components/ui/Button";

import { saveBar } from "../styles";
import type { SaveBarProps } from "./types";

export function SaveBar({ isDirty, isSaving, saveDisabled, onSave, onCancel }: SaveBarProps) {
  if (!isDirty && !isSaving) return null;
  return (
    <div className={saveBar()}>
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={isSaving || Boolean(saveDisabled)} size="sm">
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
