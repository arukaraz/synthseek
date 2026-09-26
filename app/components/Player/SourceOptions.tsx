"use client";

import { sourceSegment, sourceSegmentDetail, sourceSegments } from "./styles";
import type { SourceOptionsProps } from "./types";

export function SourceOptions({ options, selected, label, onSelect }: SourceOptionsProps) {
  return (
    <div className={sourceSegments()} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          role="radio"
          aria-checked={option.key === selected}
          className={sourceSegment({ active: option.key === selected })}
          onClick={() => onSelect(option.key)}
        >
          {option.label}
          <span className={sourceSegmentDetail()}>{option.detail}</span>
        </button>
      ))}
    </div>
  );
}
