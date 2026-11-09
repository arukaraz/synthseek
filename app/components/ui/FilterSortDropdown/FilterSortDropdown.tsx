"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { ghostButton } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { ArrowDown, ArrowUp, ChevronDown, Filter, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FilterSortOptionItem } from "./FilterSortOptionItem";
import { FilterSortOrder } from "./FilterSortOrder";
import { filterColumnsOf, selectedValue } from "./helpers";
import { filterSortColumn, filterSortColumns, filterSortColumnsContent, filterSortTriggerDefault } from "./styles";
import type { FilterSortDropdownProps } from "./types";

export function FilterSortDropdown<F extends string, S extends string = string>({
  filter,
  filterGroups,
  sort,
  direction,
  children,
  triggerIcon: TriggerIcon = SlidersHorizontal,
  triggerClassName,
  triggerLabel,
  triggerLabelClassName,
  align = "start",
  dataCy,
}: FilterSortDropdownProps<F, S>) {
  const { t } = useTranslation("components");
  const FilterSectionIcon = filter?.sectionIcon ?? Filter;
  const SortSectionIcon = sort?.sectionIcon ?? SlidersHorizontal;
  const activeFilterOption = filter?.options.find((o) => o.value === filter.value);
  const activeSortOption = sort?.options.find((o) => o.value === sort.value);
  const label = triggerLabel ?? [activeFilterOption?.label, activeSortOption?.label].filter(Boolean).join(" · ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(filterSortTriggerDefault(), triggerClassName)}
          aria-label={t("filterSort.trigger", { defaultValue: "Filter and sort" })}
          data-cy={dataCy}
        >
          <TriggerIcon className="size-4" />
          <span className={cn("hidden sm:inline", triggerLabelClassName)}>{label}</span>
          {direction &&
            (direction.value === "asc" ? (
              <ArrowUp className="hidden size-3.5 opacity-60 sm:inline" />
            ) : (
              <ArrowDown className="hidden size-3.5 opacity-60 sm:inline" />
            ))}
          <ChevronDown className="size-3.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>

      {filterGroups && filterGroups.length > 0 ? (
        <DropdownMenuContent align={align} className={filterSortColumnsContent()}>
          <div className={filterSortColumns()}>
            {filterColumnsOf(filter, filterGroups, t("filterSort.filterLabel", { defaultValue: "Filter" })).map(
              (group) => {
                const GroupIcon = group.icon ?? Filter;
                return (
                  <DropdownMenuGroup key={group.id} aria-label={group.label} className={filterSortColumn()}>
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <GroupIcon className="size-3" />
                      {group.label}
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={group.value} onValueChange={group.onChange}>
                      {group.options.map((option) => (
                        <FilterSortOptionItem key={option.value} option={option} />
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                );
              }
            )}
            {(sort || direction) && (
              <DropdownMenuGroup className={filterSortColumn()}>
                {sort && (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <SortSectionIcon className="size-3" />
                      {sort.sectionLabel ?? t("filterSort.sortLabel", { defaultValue: "Sort by" })}
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={sort.value}
                      onValueChange={(v) => {
                        const next = selectedValue(sort.options, v);
                        if (next !== null) sort.onChange(next);
                      }}
                    >
                      {sort.options.map((option) => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </>
                )}
                {direction && <FilterSortOrder value={direction.value} onChange={direction.onChange} spaced />}
              </DropdownMenuGroup>
            )}
          </div>
          {children && (
            <>
              <DropdownMenuSeparator />
              {children}
            </>
          )}
        </DropdownMenuContent>
      ) : (
        <DropdownMenuContent align={align} className="min-w-52">
          {filter && (
            <>
              <DropdownMenuLabel className="flex items-center gap-2">
                <FilterSectionIcon className="size-3" />
                {filter.sectionLabel ?? t("filterSort.filterLabel", { defaultValue: "Filter" })}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filter.value}
                onValueChange={(v) => {
                  const next = selectedValue(filter.options, v);
                  if (next !== null) filter.onChange(next);
                }}
              >
                {filter.options.map((option) => (
                  <FilterSortOptionItem key={option.value} option={option} />
                ))}
              </DropdownMenuRadioGroup>
            </>
          )}

          {sort && (
            <>
              {filter && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="flex items-center gap-2">
                <SortSectionIcon className="size-3" />
                {sort.sectionLabel ?? t("filterSort.sortLabel", { defaultValue: "Sort by" })}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sort.value}
                onValueChange={(v) => {
                  const next = selectedValue(sort.options, v);
                  if (next !== null) sort.onChange(next);
                }}
              >
                {sort.options.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </>
          )}

          {direction && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t("filterSort.orderLabel", { defaultValue: "Order" })}</DropdownMenuLabel>
              <FilterSortOrder value={direction.value} onChange={direction.onChange} />
            </>
          )}

          {children && (
            <>
              <DropdownMenuSeparator />
              {children}
            </>
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

FilterSortDropdown.defaultTriggerClassName = ghostButton({ size: "sm", hover: "default" });
