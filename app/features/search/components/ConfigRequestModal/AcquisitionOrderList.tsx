"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@components/ui/Checkbox";
import { IconButton } from "@components/ui/IconButton";
import { Switch } from "@components/ui/Switch";

import { SOURCE_ROW_LABELS } from "./consts";
import { moveSource, toggleSource } from "./helpers";
import {
  acquisitionAutoRow,
  acquisitionHint,
  acquisitionRow,
  acquisitionRowBody,
  acquisitionRowPosition,
  fieldGroup,
  fieldLabel,
} from "./styles";
import type { AcquisitionOrderListProps } from "./types";

export function AcquisitionOrderList({ label, selection, lidarrAvailable, onChange }: AcquisitionOrderListProps) {
  const { t } = useTranslation("search");
  const manual = selection.mode === "manual";

  return (
    <div className={fieldGroup()}>
      <label className={fieldLabel()} id="acquisition-order-label">
        {label}
      </label>

      <div className={acquisitionAutoRow()}>
        <div className={acquisitionRowBody()}>
          <span className="text-fg text-sm font-bold">{t("config.options.acquisition.auto.label")}</span>
          <span className="text-fg/50 text-xs">{t("config.options.acquisition.auto.description")}</span>
        </div>
        <Switch
          checked={selection.mode === "auto"}
          onCheckedChange={(next) => onChange({ ...selection, mode: next ? "auto" : "manual" })}
          aria-label={t("config.options.acquisition.auto.ariaLabel")}
        />
      </div>

      {manual ? (
        <>
          <p className={acquisitionHint()}>{t("config.options.acquisition.orderHint")}</p>
          <ul aria-labelledby="acquisition-order-label" className="flex flex-col gap-2">
            {selection.order.map((key, index) => {
              const labels = SOURCE_ROW_LABELS[key];
              const active = selection.active.includes(key);
              return (
                <li key={key} className={acquisitionRow({ active })}>
                  <span className={acquisitionRowPosition()}>{index + 1}</span>
                  <div className={acquisitionRowBody()}>
                    <span className="text-fg text-sm font-medium">{t(labels.labelKey)}</span>
                    <span className="text-fg/50 text-xs">{t(labels.descriptionKey)}</span>
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
                    onCheckedChange={() => onChange(toggleSource(selection, key))}
                    aria-label={t("config.options.acquisition.useSource", { source: t(labels.labelKey) })}
                  />
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {lidarrAvailable ? (
        <button
          type="button"
          className={acquisitionHint({ interactive: true })}
          onClick={() => onChange({ ...selection, mode: selection.mode === "lidarr" ? "auto" : "lidarr" })}
        >
          {selection.mode === "lidarr"
            ? t("config.options.acquisition.lidarr.active")
            : t("config.options.acquisition.lidarr.switch")}
        </button>
      ) : null}
    </div>
  );
}
