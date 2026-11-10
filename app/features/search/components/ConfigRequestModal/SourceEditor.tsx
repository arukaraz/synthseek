"use client";

import { useTranslation } from "react-i18next";

import { SegmentedControl, type SegmentedOption } from "@components/ui/SegmentedControl";

import { describeSourceChain } from "./helpers";
import { SourceOrderList } from "./SourceOrderList";
import { acquisitionHint } from "./styles";
import type { AcquisitionMode, SourceEditorProps } from "./types";

export function SourceEditor({ selection, offered, lidarrAvailable, lidarrSlot, onChange }: SourceEditorProps) {
  const { t } = useTranslation("search");
  const options: SegmentedOption<AcquisitionMode>[] = [
    { value: "auto", label: t("config.options.acquisition.auto.label") },
    { value: "manual", label: t("config.options.acquisition.manual.label") },
  ];
  if (lidarrAvailable) options.push({ value: "lidarr", label: t("config.options.acquisition.lidarr.label") });

  return (
    <>
      <SegmentedControl
        block
        ariaLabel={t("config.rows.source")}
        value={selection.mode}
        options={options}
        onChange={(mode) => onChange({ ...selection, mode })}
      />
      {selection.mode === "auto" ? (
        <p className={acquisitionHint()}>
          {offered.length > 0
            ? t("config.options.acquisition.autoHint", { order: describeSourceChain(offered, t) })
            : t("config.options.acquisition.auto.description")}
        </p>
      ) : null}
      {selection.mode === "manual" ? (
        <>
          <p className={acquisitionHint()}>{t("config.options.acquisition.orderHint")}</p>
          <SourceOrderList selection={selection} onChange={onChange} compact ariaLabel={t("config.rows.source")} />
        </>
      ) : null}
      {selection.mode === "lidarr" ? (
        <>
          <p className={acquisitionHint()}>{t("config.options.acquisition.lidarrHint")}</p>
          {lidarrSlot}
        </>
      ) : null}
    </>
  );
}
