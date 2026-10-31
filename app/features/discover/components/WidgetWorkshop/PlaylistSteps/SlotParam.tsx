"use client";

import { useTranslation } from "react-i18next";

import { SelectMenu } from "@components/ui/SelectMenu";

import { DECADE_CHOICES } from "../constants";
import { NameRuleValue } from "../NameRuleValue";
import { TOP_CHOICES, TOP_PARAM_PREFIX } from "./constants";
import { paramText } from "./helpers";
import type { SlotParamProps } from "./types";

export function SlotParam({ slot, kind, grammar, onChange }: SlotParamProps) {
  const { t } = useTranslation(["widgets", "discover"]);
  const label = t("widgets:set.param");
  const value = slot.param ?? "";

  switch (kind) {
    case "none":
      return null;
    case "genre":
    case "artist":
      return (
        <NameRuleValue
          label={label}
          value={value}
          kind={kind}
          full
          display={paramText(kind, slot.param)}
          extra={Array.from({ length: TOP_CHOICES[kind] }, (_, index) => {
            const param = `${TOP_PARAM_PREFIX}${index + 1}`;
            return { value: param, label: paramText(kind, param) };
          })}
          onChange={onChange}
        />
      );
    case "decade":
      return (
        <SelectMenu
          ariaLabel={label}
          value={value}
          options={DECADE_CHOICES.map((year) => ({
            value: String(year),
            label: t("discover:customWidget.decade", { year }),
          }))}
          onChange={onChange}
        />
      );
    case "mood":
      return (
        <SelectMenu
          ariaLabel={label}
          value={value}
          options={grammar.moods.map((mood) => ({ value: mood, label: t(`widgets:set.moods.${mood}`) }))}
          onChange={onChange}
        />
      );
    case "scene":
      return (
        <SelectMenu
          ariaLabel={label}
          value={value}
          options={grammar.scenarios.map((scene) => ({ value: scene, label: t(`widgets:set.scenes.${scene}`) }))}
          onChange={onChange}
        />
      );
    case "taste":
      return (
        <SelectMenu
          ariaLabel={label}
          value={value}
          options={Array.from({ length: grammar.limits.tasteGroupsMax }, (_, index) => ({
            value: String(index + 1),
            label: paramText(kind, String(index + 1)),
          }))}
          onChange={onChange}
        />
      );
  }
}
