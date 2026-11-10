"use client";

import { useTranslation } from "react-i18next";

import { FORMAT_OPTIONS } from "@api/__generated__/types";
import { SegmentedControl } from "@components/ui/SegmentedControl";

import { ChoicePills } from "./ChoicePills";
import { BITRATE_OPTIONS, LOSS_FALLBACK_OPTIONS, QUALITY_MODE_OPTIONS } from "./constants";
import { EditorField } from "./EditorField";
import { allowsLossless, isLosslessActive, withQualityMode } from "./helpers";
import type { SelectionEditorProps } from "./types";

export function QualityEditor({ value, onChange }: SelectionEditorProps) {
  const { t } = useTranslation("search");
  const losslessAvailable = allowsLossless(value.acquisition);
  const lossless = isLosslessActive(value);
  const fallback = LOSS_FALLBACK_OPTIONS.find((option) => option.value === value.formatMatching);
  const bitrate = BITRATE_OPTIONS.find((option) => option.value === value.bitrate);

  return (
    <>
      <EditorField
        label={t("config.fields.quality")}
        help={losslessAvailable ? undefined : t("config.options.qualityMode.losslessNeedsSlskd")}
      >
        <SegmentedControl
          block
          ariaLabel={t("config.fields.quality")}
          value={lossless ? "lossless" : "standard"}
          options={QUALITY_MODE_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
            disabled: option.value === "lossless" && !losslessAvailable,
          }))}
          onChange={(mode) => onChange(withQualityMode(value, mode))}
        />
      </EditorField>
      {lossless ? (
        <EditorField label={t("config.fields.ifNoFlac")} help={fallback ? t(fallback.descriptionKey) : undefined}>
          <SegmentedControl
            block
            ariaLabel={t("config.fields.ifNoFlac")}
            value={value.formatMatching}
            options={LOSS_FALLBACK_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) }))}
            onChange={(formatMatching) => onChange({ ...value, formatMatching })}
          />
        </EditorField>
      ) : (
        <>
          <EditorField label={t("config.fields.format")}>
            <ChoicePills
              ariaLabel={t("config.fields.format")}
              options={FORMAT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              value={value.format}
              onChange={(format) => onChange({ ...value, format })}
            />
          </EditorField>
          <EditorField label={t("config.fields.bitrate")} help={bitrate ? t(bitrate.descriptionKey) : undefined}>
            <SegmentedControl
              block
              ariaLabel={t("config.fields.bitrate")}
              value={String(value.bitrate)}
              options={BITRATE_OPTIONS.map((option) => ({ value: String(option.value), label: String(option.value) }))}
              onChange={(next) => onChange({ ...value, bitrate: Number(next) })}
            />
          </EditorField>
        </>
      )}
    </>
  );
}
