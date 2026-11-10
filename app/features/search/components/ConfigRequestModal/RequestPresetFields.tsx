"use client";

import { useTranslation } from "react-i18next";

import { FORMAT_OPTIONS, RequestMatchingMode, type RequestFormat } from "@api/__generated__/types";

import { AcquisitionOrderList } from "./AcquisitionOrderList";
import {
  AVAILABILITY_OPTIONS,
  BITRATE_OPTIONS,
  MATCHING_OPTIONS,
  QUALITY_MODE_OPTIONS,
  UPLOAD_SPEED_OPTIONS,
} from "./constants";
import { allowsLossless, isLidarrSelected, usesSlskd, withQualityMode } from "./helpers";
import { OptionGrid } from "./OptionGrid";
import { sectionHeading, sectionStack } from "./styles";
import type { AvailabilityMode, Option, QualityMode, RequestPresetFieldsProps, RequestSelection } from "./types";

export function RequestPresetFields({
  value,
  onChange,
  lidarrAvailable = false,
  lidarrSlot,
}: RequestPresetFieldsProps) {
  const { t } = useTranslation("search");
  const set = <K extends keyof RequestSelection>(key: K, next: RequestSelection[K]) =>
    onChange({ ...value, [key]: next });

  const losslessAvailable = allowsLossless(value.acquisition);
  const losslessActive = value.qualityMode === "lossless" && losslessAvailable;
  const lidarrSelected = isLidarrSelected(value.acquisition);

  const qualityOptions: Option<QualityMode>[] = QUALITY_MODE_OPTIONS.filter(
    (opt) => losslessAvailable || opt.value !== "lossless"
  ).map((opt) => ({ value: opt.value, label: t(opt.labelKey), description: t(opt.descriptionKey) }));

  const bitrateOptions: Option<number>[] = BITRATE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: t(opt.descriptionKey),
  }));

  const formatOptions: Option<RequestFormat>[] = FORMAT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: opt.desc,
  }));

  const matchingOptions: Option<RequestMatchingMode>[] = MATCHING_OPTIONS.map((opt) => ({
    value: RequestMatchingMode.enum[opt.value],
    label: t(opt.labelKey),
    description: t(opt.descriptionKey),
  }));

  const formatMatchingOptions: Option<RequestMatchingMode>[] = losslessActive
    ? MATCHING_OPTIONS.map((opt) => ({
        value: RequestMatchingMode.enum[opt.value],
        label: t(opt.labelKey),
        description: t(
          opt.value === "strict"
            ? "config.options.matching.losslessStrict.description"
            : "config.options.matching.losslessFlexible.description"
        ),
      }))
    : matchingOptions;

  const uploadSpeedOptions: Option<number>[] = UPLOAD_SPEED_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.labelKey ? t(opt.labelKey) : (opt.label ?? ""),
    description: t(opt.descriptionKey),
  }));

  const availabilityOptions: Option<AvailabilityMode>[] = AVAILABILITY_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
    description: t(opt.descriptionKey),
  }));

  return (
    <>
      <div className={sectionStack()}>
        <h3 className={sectionHeading()}>{t("config.sections.acquisition")}</h3>
        <AcquisitionOrderList
          label={t("config.fields.acquisition")}
          selection={value.acquisition}
          lidarrAvailable={lidarrAvailable}
          onChange={(acquisition) => set("acquisition", acquisition)}
        />
      </div>

      {lidarrSelected ? (
        lidarrSlot
      ) : (
        <>
          <div className={sectionStack()}>
            <h3 className={sectionHeading()}>{t("config.sections.quality")}</h3>
            <OptionGrid
              label={t("config.fields.quality")}
              options={qualityOptions}
              value={losslessActive ? "lossless" : "standard"}
              onChange={(mode) => onChange(withQualityMode(value, mode))}
              columns={2}
              showCheckmark
            />
            <OptionGrid
              label={t("config.fields.bitrate")}
              options={bitrateOptions}
              value={value.bitrate}
              onChange={(bitrate) => set("bitrate", bitrate)}
              columns={4}
            />
            <OptionGrid
              label={t("config.fields.format")}
              options={formatOptions}
              value={value.format}
              onChange={(format) => set("format", format)}
              columns={4}
              disabled={losslessActive}
            />
          </div>

          {losslessAvailable && (
            <div className={sectionStack()}>
              <h3 className={sectionHeading()}>{t("config.sections.matching")}</h3>
              <OptionGrid
                label={t("config.fields.bitrateMatching")}
                options={matchingOptions}
                value={value.bitrateMatching}
                onChange={(matching) => set("bitrateMatching", matching)}
                columns={2}
                showCheckmark
              />
              <OptionGrid
                label={t("config.fields.formatMatching")}
                options={formatMatchingOptions}
                value={value.formatMatching}
                onChange={(matching) => set("formatMatching", matching)}
                columns={2}
                showCheckmark
              />
            </div>
          )}

          {usesSlskd(value.acquisition) && (
            <div className={sectionStack()}>
              <h3 className={sectionHeading()}>{t("config.sections.peer")}</h3>
              <OptionGrid
                label={t("config.fields.minUploadSpeed")}
                options={uploadSpeedOptions}
                value={value.minUploadSpeed}
                onChange={(speed) => set("minUploadSpeed", speed)}
                columns={4}
              />
              <OptionGrid
                label={t("config.fields.availability")}
                options={availabilityOptions}
                value={value.availability}
                onChange={(availability) => set("availability", availability)}
                columns={2}
                showCheckmark
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
