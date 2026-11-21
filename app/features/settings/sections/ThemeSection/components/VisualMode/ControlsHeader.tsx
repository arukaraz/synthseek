"use client";

import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";

import { changeDot, controlsTop, linkButton, searchField } from "./styles";
import type { ControlsHeaderProps } from "./types";

export function ControlsHeader({
  query,
  onQuery,
  showToggle,
  showAll,
  total,
  hiddenChange,
  onToggle,
}: ControlsHeaderProps) {
  const { t } = useTranslation("themeEditor");

  return (
    <div className={controlsTop()}>
      <Input
        type="search"
        size="sm"
        className={searchField()}
        value={query}
        placeholder={t("visual.search")}
        aria-label={t("visual.search")}
        onChange={(event) => onQuery(event.target.value)}
      />
      {showToggle ? (
        <button type="button" className={linkButton()} onClick={onToggle}>
          {showAll ? t("visual.showEssentials") : t("visual.showAll", { count: total })}
          {hiddenChange ? (
            <span
              className={changeDot()}
              title={t("visual.hiddenChange")}
              role="img"
              aria-label={t("visual.hiddenChange")}
            />
          ) : null}
        </button>
      ) : null}
    </div>
  );
}
