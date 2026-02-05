"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { ghostButton } from "@theme/utilities/styles";
import { Activity, CheckCircle, ChevronDown, LayoutGrid, XCircle, LucideIcon } from "lucide-react";
import { StatusFilter } from "../../types";

const FILTER_OPTIONS: { value: StatusFilter; label: string; icon: LucideIcon }[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "active", label: "Active", icon: Activity },
  { value: "done", label: "Done", icon: CheckCircle },
  { value: "failed", label: "Failed", icon: XCircle },
];

interface StatusFilterDropdownProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

export function StatusFilterDropdown({ value, onChange }: StatusFilterDropdownProps) {
  const current = FILTER_OPTIONS.find((o) => o.value === value);
  const CurrentIcon = current?.icon ?? LayoutGrid;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={ghostButton({ size: "sm", hover: "default" })}>
          <CurrentIcon className="size-3.5 sm:size-3" />
          <span className="hidden sm:inline">{current?.label}</span>
          <ChevronDown className="size-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-30">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as StatusFilter)}>
          {FILTER_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <option.icon className="mr-2 size-3.5" />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
