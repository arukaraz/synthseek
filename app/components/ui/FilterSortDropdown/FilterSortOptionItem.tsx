"use client";

import { DropdownMenuRadioItem } from "@components/ui/DropdownMenu";
import { cn } from "@utils/cn";

import { filterSortCount } from "./styles";
import type { FilterSortOptionItemProps } from "./types";

export function FilterSortOptionItem({ option }: FilterSortOptionItemProps) {
  const Icon = option.icon;
  return (
    <DropdownMenuRadioItem value={option.value}>
      {Icon && <Icon className={cn("mr-2 size-3.5", option.iconClassName)} />}
      <span className="flex-1">{option.label}</span>
      {option.count !== undefined && <span className={filterSortCount()}>{option.count}</span>}
    </DropdownMenuRadioItem>
  );
}
