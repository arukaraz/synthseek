"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { useTapToOpen } from "@hooks/ui/useTapToOpen";
import { ChevronDown } from "lucide-react";
import { fieldGroup, fieldLabel, lidarrSelectRadioItem, lidarrSelectTrigger } from "./styles";
import type { LidarrSelectProps } from "./types";

export function LidarrSelect<T extends string | number>({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
}: LidarrSelectProps<T>) {
  const tap = useTapToOpen();
  const activeOption = options.find((option) => String(option.value) === String(value));

  return (
    <div className={fieldGroup()}>
      <label className={fieldLabel()}>{label}</label>
      <DropdownMenu open={tap.open} onOpenChange={tap.onOpenChange}>
        <DropdownMenuTrigger asChild tapToOpen={tap.triggerProps}>
          <button type="button" className={lidarrSelectTrigger()} disabled={disabled} aria-label={label}>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">
                {activeOption ? activeOption.label : placeholder}
              </span>
              {activeOption?.description ? (
                <span className="text-fg/50 block truncate text-xs">{activeOption.description}</span>
              ) : null}
            </span>
            <ChevronDown className="text-fg/50 size-4 shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="max-h-72 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto">
          <DropdownMenuRadioGroup
            value={value !== undefined ? String(value) : ""}
            onValueChange={(next) => {
              const match = options.find((option) => String(option.value) === next);
              if (match) onChange(match.value);
            }}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={String(option.value)}
                value={String(option.value)}
                className={lidarrSelectRadioItem()}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {option.description ? <span className="text-fg/50 text-xs">{option.description}</span> : null}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
