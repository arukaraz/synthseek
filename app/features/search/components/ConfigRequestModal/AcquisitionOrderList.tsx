"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { SourceOrderList } from "./SourceOrderList";
import {
  acquisitionAutoRow,
  acquisitionHint,
  acquisitionRowBody,
  acquisitionRowDescription,
  acquisitionRowLead,
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
          <span className={acquisitionRowLead()}>{t("config.options.acquisition.auto.label")}</span>
          <span className={acquisitionRowDescription()}>{t("config.options.acquisition.auto.description")}</span>
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
          <SourceOrderList
            selection={selection}
            onChange={onChange}
            compact={false}
            ariaLabelledBy="acquisition-order-label"
          />
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
