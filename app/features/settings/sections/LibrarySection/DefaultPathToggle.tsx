"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { defaultPathHint } from "./helpers";
import { fieldMessage, toggleHint, toggleRow, toggleText, toggleTitle } from "./styles";
import type { DefaultPathToggleProps } from "./types";

export function DefaultPathToggle({
  checked,
  onCheckedChange,
  path,
  readonly,
  currentDefaultLabel,
  refused,
}: DefaultPathToggleProps) {
  const { t } = useTranslation("settings");
  const id = useId();
  const isDefault = path?.isDefault === true;

  return (
    <div className={toggleRow()}>
      <div className={toggleText()}>
        <span id={`${id}-title`} className={toggleTitle()}>
          {t("libraryPaths.default.label")}
        </span>
        <span id={`${id}-hint`} className={toggleHint()}>
          {defaultPathHint({ readonly, isDefault, currentDefaultLabel })}
        </span>
        {refused ? (
          <span className={fieldMessage({ tone: "danger" })}>{t("libraryPaths.default.readonly")}</span>
        ) : null}
      </div>
      <Switch
        checked={checked && !readonly}
        onCheckedChange={onCheckedChange}
        disabled={isDefault || readonly}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-hint`}
      />
    </div>
  );
}
