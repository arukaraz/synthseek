"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { ghostButton } from "@theme/utilities/styles";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { SortField } from "../../types";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "recents", label: "Recent" },
  { value: "artist", label: "Artist" },
  { value: "album", label: "Album" },
];

interface SortDropdownProps {
  value: SortField;
  onChange: (value: SortField) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const current = SORT_OPTIONS.find((o) => o.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={ghostButton({ size: "sm", hover: "default" })}>
          <ArrowUpDown className="size-3.5 sm:size-3" />
          <span className="hidden sm:inline">{current?.label}</span>
          <ChevronDown className="size-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-25">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as SortField)}>
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
