"use client";

import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";

import { AVAILABILITY_OPTIONS, UPLOAD_SPEED_OPTIONS } from "./constants";
import { EditorField } from "./EditorField";
import { describeUploadSpeed } from "./helpers";
import type { SelectionEditorProps } from "./types";

export function PeerEditor({ value, onChange }: SelectionEditorProps) {
  const { t } = useTranslation("search");
  const availability = AVAILABILITY_OPTIONS.find((option) => option.value === value.availability);

  return (
    <>
      <EditorField label={t("config.fields.minUploadSpeed")}>
        <SegmentedControl
          block
          ariaLabel={t("config.fields.minUploadSpeed")}
          value={String(value.minUploadSpeed)}
          options={UPLOAD_SPEED_OPTIONS.map((option) => ({
            value: String(option.value),
            label: describeUploadSpeed(option.value, t),
          }))}
          onChange={(next) => onChange({ ...value, minUploadSpeed: Number(next) })}
        />
      </EditorField>
      <EditorField
        label={t("config.fields.availability")}
        help={availability ? t(availability.descriptionKey) : undefined}
      >
        <SegmentedControl
          block
          ariaLabel={t("config.fields.availability")}
          value={value.availability}
          options={AVAILABILITY_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) }))}
          onChange={(next) => onChange({ ...value, availability: next })}
        />
      </EditorField>
    </>
  );
}
