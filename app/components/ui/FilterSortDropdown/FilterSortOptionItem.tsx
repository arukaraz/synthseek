"use client";

import { DropdownMenuRadioItem } from "@components/ui/DropdownMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/Tooltip";
import { cn } from "@utils/cn";

import { filterSortCount, filterSortLabel, filterSortStatus } from "./styles";
import type { FilterSortOptionItemProps } from "./types";

export function FilterSortOptionItem({ option }: FilterSortOptionItemProps) {
  const Icon = option.icon;
  const item = (
    <DropdownMenuRadioItem value={option.value} aria-label={option.content ? option.label : undefined}>
      {Icon && <Icon className={cn("mr-2 size-3.5", option.iconClassName)} />}
      <span className={filterSortLabel()}>{option.content ?? option.label}</span>
      {option.status !== undefined ? (
        <span className={filterSortStatus()}>{option.status}</span>
      ) : option.count !== undefined ? (
        <span className={filterSortCount()}>{option.count}</span>
      ) : null}
    </DropdownMenuRadioItem>
  );
  if (!option.tooltip) return item;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{item}</TooltipTrigger>
      <TooltipContent side="right">{option.tooltip}</TooltipContent>
    </Tooltip>
  );
}
