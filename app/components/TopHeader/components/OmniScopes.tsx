"use client";

import { useTranslation } from "react-i18next";

import { FILTER_TABS } from "@features/search/components/Results/constants";
import { getContentTypeIcon } from "@utils/content-type-helpers";

import { scopeChip, scopeGroup, scopeIcon } from "../styles";
import type { OmniScopesProps } from "../types";

export function OmniScopes({ value, onChange, layout }: OmniScopesProps) {
  const { t } = useTranslation(["components", "search"]);

  return (
    <div role="radiogroup" aria-label={t("header.omni.scopes")} className={scopeGroup({ layout })}>
      {FILTER_TABS.map((tab) => {
        const active = tab.value === value;
        const Icon = tab.value === "all" ? null : getContentTypeIcon(tab.value);
        return (
          <button
            key={tab.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={-1}
            className={scopeChip({ active })}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onChange(tab.value)}
          >
            {Icon ? <Icon aria-hidden className={scopeIcon({ type: tab.value, active })} /> : null}
            {t(tab.labelKey, { ns: "search" })}
          </button>
        );
      })}
    </div>
  );
}
