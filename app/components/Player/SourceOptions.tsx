"use client";

import { Check } from "lucide-react";

import { SourceMark } from "./SourceMark";
import { sourceCard, sourceCardCheck, sourceCardDetail, sourceCardLabel, sourceList } from "./styles";
import type { SourceOptionsProps } from "./types";

export function SourceOptions({ options, selected, label, onSelect }: SourceOptionsProps) {
  return (
    <div className={sourceList()} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const active = option.key === selected;
        return (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={active}
            className={sourceCard({ active })}
            onClick={() => onSelect(option.key)}
          >
            <SourceMark sourceKey={option.key} />
            <span className={sourceCardLabel()}>{option.label}</span>
            <span className={sourceCardDetail()}>{option.detail}</span>
            <Check className={sourceCardCheck({ active })} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
