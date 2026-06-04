"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isAcquisitionMethod } from "./helpers";
import { acquisitionRadioItem, acquisitionTrigger } from "./styles";
import type { AcquisitionDropdownProps } from "./types";

export function AcquisitionDropdown({ label, value, options, onChange }: AcquisitionDropdownProps) {
  const { t } = useTranslation("search");
  const activeOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="space-y-2">
      <label className="text-fg/90 text-sm font-medium" id="acquisition-method-label">
        {label}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={acquisitionTrigger()}
            aria-labelledby="acquisition-method-label"
            data-cy="acquisition-method-trigger"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">{activeOption ? t(activeOption.labelKey) : ""}</span>
              <span className="text-fg/50 block text-xs">{activeOption ? t(activeOption.descriptionKey) : ""}</span>
            </span>
            <ChevronDown className="text-fg/50 size-4 shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => {
              if (isAcquisitionMethod(next)) onChange(next);
            }}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value} className={acquisitionRadioItem()}>
                <span className="text-sm font-medium">{t(option.labelKey)}</span>
                <span className="text-fg/50 text-xs">{t(option.descriptionKey)}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
