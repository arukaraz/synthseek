"use client";

import { useCallback, useRef } from "react";

import type { Theme } from "@theme/ThemeProvider";

import { isRovingKey, nextRovingIndex } from "./helpers";
import { themeGrid } from "./styles";
import { ThemeCardOption } from "./ThemeCardOption";
import type { ThemeCardKeyboardEvent, ThemeSelectorProps } from "./types";

export function ThemeSelector({ value, options, onSelect, ariaLabel }: ThemeSelectorProps) {
  const refs = useRef(new Map<Theme, HTMLButtonElement>());

  const registerRef = useCallback((option: Theme, node: HTMLButtonElement | null) => {
    if (node) refs.current.set(option, node);
    else refs.current.delete(option);
  }, []);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const tabbableValue = selectedIndex >= 0 ? value : options[0].value;

  const handleKeyNav = useCallback(
    (event: ThemeCardKeyboardEvent, current: Theme) => {
      if (!isRovingKey(event.key)) return;
      event.preventDefault();
      const currentIndex = options.findIndex((option) => option.value === current);
      const target = options[nextRovingIndex(currentIndex, options.length, event.key)];
      refs.current.get(target.value)?.focus();
      onSelect(target.value);
    },
    [onSelect, options]
  );

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={themeGrid()}>
      {options.map((option) => (
        <ThemeCardOption
          key={option.value}
          option={option}
          selected={value === option.value}
          tabbable={option.value === tabbableValue}
          onSelect={onSelect}
          registerRef={registerRef}
          onKeyNav={handleKeyNav}
        />
      ))}
    </div>
  );
}
