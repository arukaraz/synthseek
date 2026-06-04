"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SettingsCard } from "../../components/SettingsCard";
import { isThemeValue } from "./helpers";
import { ThemeSelector } from "./ThemeSelector";

export function ThemeCard() {
  const { t } = useTranslation("settings");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selected = mounted && isThemeValue(theme) ? theme : undefined;

  return (
    <SettingsCard title={t("general.theme.title")} description={t("general.theme.description")}>
      <ThemeSelector value={selected} onSelect={setTheme} ariaLabel={t("general.theme.groupLabel")} />
    </SettingsCard>
  );
}
