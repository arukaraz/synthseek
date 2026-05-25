"use client";

import { Button } from "@components/ui/Button";

import { saveBar } from "../styles";

interface SaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function SaveBar({ isDirty, isSaving, onSave, onCancel }: SaveBarProps) {
  if (!isDirty && !isSaving) return null;
  return (
    <div className={saveBar()}>
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={isSaving} size="sm">
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
