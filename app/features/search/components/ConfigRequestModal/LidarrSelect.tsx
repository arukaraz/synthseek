"use client";

import { SelectMenu } from "@components/ui/SelectMenu";
import { fieldGroup, fieldLabel } from "./styles";
import type { LidarrSelectProps } from "./types";

export function LidarrSelect<T extends string | number>({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
}: LidarrSelectProps<T>) {
  return (
    <div className={fieldGroup()}>
      <label className={fieldLabel()}>{label}</label>
      <SelectMenu
        size="lg"
        ariaLabel={label}
        placeholder={placeholder}
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
