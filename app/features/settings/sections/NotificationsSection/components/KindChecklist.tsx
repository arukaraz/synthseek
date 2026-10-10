"use client";

import { useTranslation } from "react-i18next";

import { Checkbox } from "@components/ui/Checkbox";

import { categorySelection, withCategory, withKind } from "../helpers";
import {
  checklistGrid,
  checklistGroup,
  checklistGroupTitle,
  checklistHeading,
  checklistOption,
  checklistOptions,
} from "../styles";
import type { KindChecklistProps } from "../types";

export function KindChecklist({ categories, selected, disabled, onChange }: KindChecklistProps) {
  const { t } = useTranslation("settings");

  return (
    <div className="flex flex-col gap-3">
      <h3 className={checklistHeading()}>{t("notifications.whatToSend")}</h3>
      <div className={checklistGrid()}>
        {categories.map((category) => {
          const state = categorySelection(category.kinds, selected);
          const title = t(`notifications.categories.${category.id}`);
          return (
            <fieldset key={category.id} className={checklistGroup()} disabled={disabled}>
              <legend className="sr-only">{title}</legend>
              <label className={checklistGroupTitle()}>
                <Checkbox
                  checked={state}
                  onCheckedChange={() => onChange(withCategory(category.kinds, selected, state !== true))}
                  aria-label={t("notifications.selectCategory", { category: title })}
                  disabled={disabled}
                />
                {title}
              </label>
              <div className={checklistOptions()}>
                {category.kinds.map((kind) => {
                  const label = t(`notifications.kinds.${kind}`);
                  return (
                    <label key={kind} className={checklistOption()}>
                      <Checkbox
                        checked={selected.includes(kind)}
                        onCheckedChange={(checked) => onChange(withKind(selected, kind, checked === true))}
                        aria-label={label}
                        disabled={disabled}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
