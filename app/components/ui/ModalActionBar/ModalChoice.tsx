"use client";

import { Switch } from "@components/ui/Switch";

import { modalChoice } from "./styles";
import type { ModalChoiceProps } from "./types";

export function ModalChoice({ label, hint, checked, onChange, disabled }: ModalChoiceProps) {
  return (
    <label className={modalChoice()} title={hint}>
      <Switch checked={checked} onCheckedChange={(next) => onChange(Boolean(next))} disabled={disabled} />
      {label}
    </label>
  );
}
