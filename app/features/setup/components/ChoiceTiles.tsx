"use client";

import { useId } from "react";

import { choiceInput, choiceTile, choiceTileCaption, choiceTiles, choiceTileTitle } from "../styles";
import type { ChoiceTilesProps } from "../types";

export function ChoiceTiles({ label, choices, selected, disabled = false, onChoose }: ChoiceTilesProps) {
  const groupName = useId();

  return (
    <div role="radiogroup" aria-label={label} className={choiceTiles()}>
      {choices.map((choice) => (
        <label key={choice.key} className={choiceTile({ selected: selected === choice.key })}>
          <input
            type="radio"
            name={groupName}
            value={choice.key}
            checked={selected === choice.key}
            disabled={disabled}
            onChange={() => onChoose(choice.key)}
            className={choiceInput()}
          />
          <span className={choiceTileTitle()}>{choice.title}</span>
          <span className={choiceTileCaption()}>{choice.caption}</span>
        </label>
      ))}
    </div>
  );
}
