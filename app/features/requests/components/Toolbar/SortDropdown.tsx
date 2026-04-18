"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { titleCase } from "@utils/formatters";
import { ghostButton } from "@theme/utilities/styles";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { SortField } from "../../types";

interface SortDropdownProps {
  value: SortField;
  onChange: (value: SortField) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={ghostButton({ size: "sm", hover: "default" })}>
          <ArrowUpDown className="size-3.5 sm:size-3" />
          <span className="hidden sm:inline">{titleCase(value)}</span>
          <ChevronDown className="size-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-25">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as SortField)}>
          {Object.values(SortField).map((field) => (
            <DropdownMenuRadioItem key={field} value={field}>
              {titleCase(field)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
