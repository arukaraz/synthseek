"use client";

import { useTranslation } from "react-i18next";

import { RequestMatchingMode } from "@api/__generated__/types";
import { SegmentedControl } from "@components/ui/SegmentedControl";

import { MATCHING_OPTIONS } from "./constants";
import { EditorField } from "./EditorField";
import { editorGrid } from "./styles";
import type { SelectionEditorProps } from "./types";

export function MatchingEditor({ value, onChange }: SelectionEditorProps) {
  const { t } = useTranslation("search");
  const options = MATCHING_OPTIONS.map((option) => ({
    value: RequestMatchingMode.enum[option.value],
    label: t(option.labelKey),
  }));

  return (
    <div className={editorGrid()}>
      <EditorField label={t("config.fields.bitrate")}>
        <SegmentedControl
          block
          ariaLabel={t("config.fields.bitrateMatching")}
          value={value.bitrateMatching}
          options={options}
          onChange={(bitrateMatching) => onChange({ ...value, bitrateMatching })}
        />
      </EditorField>
      <EditorField label={t("config.fields.format")}>
        <SegmentedControl
          block
          ariaLabel={t("config.fields.formatMatching")}
          value={value.formatMatching}
          options={options}
          onChange={(formatMatching) => onChange({ ...value, formatMatching })}
        />
      </EditorField>
    </div>
  );
}
