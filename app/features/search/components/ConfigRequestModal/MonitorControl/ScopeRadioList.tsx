"use client";

import { cn } from "@utils/cn";
import { useId, useRef } from "react";
import { fieldGroup, fieldLabel } from "../styles";
import { nextRadioIndex } from "./helpers";
import {
  scopeRadioDescription,
  scopeRadioDot,
  scopeRadioIndicator,
  scopeRadioList,
  scopeRadioRow,
  scopeRadioTitle,
} from "./styles";
import type { ScopeRadioListProps } from "./types";

export function ScopeRadioList<T extends string>({ label, options, value, onChange }: ScopeRadioListProps<T>) {
  const groupId = useId();
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = options.findIndex((option) => option.value === value);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const target = nextRadioIndex(event.key, currentIndex, options.length);
    if (target === null) return;
    event.preventDefault();
    const option = options[target];
    if (!option) return;
    onChange(option.value);
    rowRefs.current[target]?.focus();
  };

  return (
    <div className={fieldGroup()} role="radiogroup" aria-labelledby={`${groupId}-label`}>
      <span id={`${groupId}-label`} className={fieldLabel()}>
        {label}
      </span>
      <div className={scopeRadioList()}>
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const descriptionId = `${groupId}-${index}-description`;
          const isTabbable = selectedIndex === -1 ? index === 0 : isSelected;

          return (
            <button
              key={option.value}
              ref={(node) => {
                rowRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-describedby={descriptionId}
              tabIndex={isTabbable ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={scopeRadioRow({ selected: isSelected })}
            >
              <span className={scopeRadioIndicator({ selected: isSelected })} aria-hidden="true">
                {isSelected && <span className={scopeRadioDot()} />}
              </span>
              <span className="min-w-0">
                <span className={cn("block", scopeRadioTitle({ selected: isSelected }))}>{option.label}</span>
                <span id={descriptionId} className={cn("block", scopeRadioDescription({ selected: isSelected }))}>
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
