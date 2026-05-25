"use client";

import { Switch } from "@components/ui/Switch";

import { toggleDescription, toggleLabel, toggleRow } from "../styles";

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function SettingsToggle({ label, description, checked, onCheckedChange, disabled, id }: SettingsToggleProps) {
  const controlId = id ?? `toggle-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={toggleRow()}>
      <label htmlFor={controlId} className="flex min-w-0 flex-col gap-0.5">
        <span className={toggleLabel()}>{label}</span>
        {description ? <span className={toggleDescription()}>{description}</span> : null}
      </label>
      <Switch id={controlId} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
