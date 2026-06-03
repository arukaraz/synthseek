"use client";

import { useCallback, useRef } from "react";

import type { Theme } from "@theme/ThemeProvider";

import { FEATURED_THEME, THEME_OPTIONS } from "./constants";
import { isRovingKey, nextRovingIndex } from "./helpers";
import { themeGrid } from "./styles";
import { ThemeCardOption } from "./ThemeCardOption";
import type { ThemeCardKeyboardEvent, ThemeSelectorProps } from "./types";

export function ThemeSelector({ value, onSelect, ariaLabel }: ThemeSelectorProps) {
  const refs = useRef(new Map<Theme, HTMLButtonElement>());

  const registerRef = useCallback((option: Theme, node: HTMLButtonElement | null) => {
    if (node) refs.current.set(option, node);
    else refs.current.delete(option);
  }, []);

  const selectedIndex = THEME_OPTIONS.findIndex((option) => option.value === value);
  const tabbableValue = selectedIndex >= 0 ? value : THEME_OPTIONS[0].value;

  const handleKeyNav = useCallback(
    (event: ThemeCardKeyboardEvent, current: Theme) => {
      if (!isRovingKey(event.key)) return;
      event.preventDefault();
      const currentIndex = THEME_OPTIONS.findIndex((option) => option.value === current);
      const target = THEME_OPTIONS[nextRovingIndex(currentIndex, THEME_OPTIONS.length, event.key)];
      refs.current.get(target.value)?.focus();
      onSelect(target.value);
    },
    [onSelect]
  );

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={themeGrid()}>
      {THEME_OPTIONS.map((option) => (
        <ThemeCardOption
          key={option.value}
          option={option}
          selected={value === option.value}
          featured={option.value === FEATURED_THEME}
          tabbable={option.value === tabbableValue}
          onSelect={onSelect}
          registerRef={registerRef}
          onKeyNav={handleKeyNav}
        />
      ))}
    </div>
  );
}
