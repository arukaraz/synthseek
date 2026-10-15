"use client";

import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { useTapToOpen } from "@hooks/ui/useTapToOpen";

import {
  selectMenuContent,
  selectMenuDescription,
  selectMenuItem,
  selectMenuItemDescription,
  selectMenuItemLabel,
  selectMenuLabel,
  selectMenuTrigger,
  selectMenuValue,
} from "./styles";
import type { SelectMenuProps } from "./types";

export function SelectMenu<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
  disabled = false,
  size = "md",
}: SelectMenuProps<T>) {
  const tap = useTapToOpen();
  const active = options.find((option) => String(option.value) === String(value));

  return (
    <DropdownMenu open={tap.open} onOpenChange={tap.onOpenChange}>
      <DropdownMenuTrigger asChild tapToOpen={tap.triggerProps}>
        <button type="button" className={selectMenuTrigger({ size })} disabled={disabled} aria-label={ariaLabel}>
          <span className={selectMenuValue({ size })}>
            <span className={selectMenuLabel({ size })}>{active ? active.label : placeholder}</span>
            {size === "lg" && active?.description ? (
              <span className={selectMenuDescription()}>{active.description}</span>
            ) : null}
          </span>
          <ChevronDown className="text-fg/50 size-4 shrink-0" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={selectMenuContent()}>
        <DropdownMenuRadioGroup
          value={value === null || value === undefined ? "" : String(value)}
          onValueChange={(next) => {
            const match = options.find((option) => String(option.value) === next);
            if (match) onChange(match.value);
          }}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={String(option.value)} value={String(option.value)} className={selectMenuItem()}>
              <span className={selectMenuItemLabel()}>{option.label}</span>
              {option.description ? <span className={selectMenuItemDescription()}>{option.description}</span> : null}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
