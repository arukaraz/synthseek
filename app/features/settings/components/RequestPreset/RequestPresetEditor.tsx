"use client";

import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";
import { RequestPresetFields } from "@features/search/components/ConfigRequestModal/RequestPresetFields";

import { presetEditorBody, presetFollowNote } from "./styles";
import type { PresetChoice, RequestPresetEditorProps } from "./types";

export function RequestPresetEditor({
  value,
  onChange,
  followLabel,
  customLabel,
  followSummary,
}: RequestPresetEditorProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={presetEditorBody()}>
      <SegmentedControl<PresetChoice>
        value={value.choice}
        options={[
          { value: "follow", label: followLabel },
          { value: "custom", label: customLabel },
        ]}
        onChange={(choice) => onChange({ ...value, choice })}
        ariaLabel={t("requestPreset.choiceAriaLabel")}
      />
      {value.choice === "follow" ? (
        <p className={presetFollowNote()} data-cy="request-preset-follow">
          {followSummary}
        </p>
      ) : (
        <RequestPresetFields value={value.selection} onChange={(selection) => onChange({ ...value, selection })} />
      )}
    </div>
  );
}
