"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";

import { widgetIconOf } from "../CustomWidget/helpers";
import { matchingIcons } from "./helpers";
import { iconButton, iconEmpty, iconGrid, iconSearch } from "./styles";
import type { IconPickerProps } from "./types";

export function IconPicker({ icons, value, onChange }: IconPickerProps) {
  const { t } = useTranslation("widgets");
  const [query, setQuery] = useState("");
  const shown = matchingIcons(icons, query);

  return (
    <>
      <Input
        type="search"
        size="sm"
        className={iconSearch()}
        value={query}
        placeholder={t("details.iconSearch")}
        aria-label={t("details.iconSearch")}
        onChange={(event) => setQuery(event.target.value)}
      />
      {shown.length === 0 ? (
        <p className={iconEmpty()}>{t("details.iconNone")}</p>
      ) : (
        <div className={iconGrid()} role="radiogroup" aria-label={t("details.icon")}>
          {shown.map((icon) => {
            const Icon = widgetIconOf(icon);
            return (
              <button
                key={icon}
                type="button"
                role="radio"
                aria-checked={icon === value}
                aria-label={t("details.iconNamed", { name: icon })}
                title={icon}
                className={iconButton({ selected: icon === value })}
                onClick={() => onChange(icon)}
              >
                <Icon aria-hidden />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
