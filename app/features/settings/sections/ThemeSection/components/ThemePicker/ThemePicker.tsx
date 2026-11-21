"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { settingsCard } from "@features/settings/styles";
import { useThemeFiles } from "@hooks/api/queries/theme";
import { useUrlParam } from "@hooks/ui/useUrlParam";
import { tokenVars } from "@theme/custom";
import { useThemeContext } from "@theme/ThemeProvider";

import { EDIT_PARAM, EDIT_PARAM_VALUE } from "../../constants";
import { THEME_VALUES } from "./constants";
import { previewPaintOf } from "./helpers";
import { themeCaption, themeEditLink } from "./styles";
import { ThemeSelector } from "./ThemeSelector";
import type { ThemeOption, ThemePickerProps } from "./types";

export function ThemePicker({ editing }: ThemePickerProps) {
  const { t } = useTranslation(["settings", "themeEditor"]);
  const { theme, custom, select, previewing } = useThemeContext();
  const [, setEditParam] = useUrlParam(EDIT_PARAM);
  const sheetOnPage = theme === "custom" || previewing;
  const saved = useThemeFiles(custom !== null && !sheetOnPage);
  const savedFiles = sheetOnPage ? undefined : saved.data?.files;

  const options = useMemo<ThemeOption[]>(() => {
    const labels = {
      dark: t("themeEditor:presets.dark"),
      midnight: t("themeEditor:presets.midnight"),
      ocean: t("themeEditor:presets.ocean"),
      custom: t("themeEditor:picker.custom"),
    };
    const savedVars = savedFiles === undefined ? undefined : tokenVars(savedFiles);
    return THEME_VALUES.map((value) => ({
      value,
      label: labels[value],
      paint: previewPaintOf(value, custom, theme, savedVars),
    }));
  }, [t, custom, theme, savedFiles]);

  const showEditLink = custom !== null && theme !== "custom" && !editing;

  return (
    <section
      className={settingsCard()}
      data-anchor-target="theme"
      data-part="card"
      aria-label={t("settings:general.theme.title")}
    >
      <ThemeSelector
        value={theme}
        options={options}
        onSelect={select}
        ariaLabel={t("settings:general.theme.groupLabel")}
      />
      <p className={themeCaption()}>
        {t("settings:general.theme.scope")}
        {showEditLink ? (
          <button type="button" className={themeEditLink()} onClick={() => setEditParam(EDIT_PARAM_VALUE)}>
            {t("themeEditor:picker.editWithoutApplying")}
          </button>
        ) : null}
      </p>
    </section>
  );
}
