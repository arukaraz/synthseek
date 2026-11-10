"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@components/ui/Checkbox";
import { IconButton } from "@components/ui/IconButton";

import { SOURCE_ROW_LABELS } from "./constants";
import { isLastActiveSource, moveSource, toggleSource } from "./helpers";
import {
  acquisitionRow,
  acquisitionRowBody,
  acquisitionRowDescription,
  acquisitionRowLabel,
  acquisitionRowPosition,
  acquisitionSourceList,
} from "./styles";
import type { SourceOrderListProps } from "./types";

export function SourceOrderList({ selection, onChange, compact, ariaLabelledBy, ariaLabel }: SourceOrderListProps) {
  const { t } = useTranslation("search");

  return (
    <ul aria-labelledby={ariaLabelledBy} aria-label={ariaLabel} className={acquisitionSourceList()}>
      {selection.order.map((key, index) => {
        const labels = SOURCE_ROW_LABELS[key];
        const active = selection.active.includes(key);
        return (
          <li key={key} className={acquisitionRow({ active })}>
            <span className={acquisitionRowPosition()}>{index + 1}</span>
            <div className={acquisitionRowBody()}>
              <span className={acquisitionRowLabel()}>{t(labels.labelKey)}</span>
              {compact ? null : <span className={acquisitionRowDescription()}>{t(labels.descriptionKey)}</span>}
            </div>
            <IconButton
              icon={ChevronUp}
              size="sm"
              aria-label={t("config.options.acquisition.moveUp", { source: t(labels.labelKey) })}
              disabled={index === 0}
              onClick={() => onChange(moveSource(selection, key, -1))}
            />
            <IconButton
              icon={ChevronDown}
              size="sm"
              aria-label={t("config.options.acquisition.moveDown", { source: t(labels.labelKey) })}
              disabled={index === selection.order.length - 1}
              onClick={() => onChange(moveSource(selection, key, 1))}
            />
            <Checkbox
              checked={active}
              disabled={isLastActiveSource(selection, key)}
              onCheckedChange={() => onChange(toggleSource(selection, key))}
              aria-label={t("config.options.acquisition.useSource", { source: t(labels.labelKey) })}
            />
          </li>
        );
      })}
    </ul>
  );
}
