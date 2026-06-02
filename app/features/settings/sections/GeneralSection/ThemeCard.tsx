"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { SettingsCard } from "../../components/SettingsCard";
import { THEME_CARD } from "./constants";
import { isThemeValue } from "./helpers";
import { ThemeSelector } from "./ThemeSelector";

export function ThemeCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selected = mounted && isThemeValue(theme) ? theme : undefined;

  return (
    <SettingsCard title={THEME_CARD.title} description={THEME_CARD.description}>
      <ThemeSelector value={selected} onSelect={setTheme} ariaLabel={THEME_CARD.groupLabel} />
    </SettingsCard>
  );
}
