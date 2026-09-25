"use client";

import { useTranslation } from "react-i18next";

import {
  settingsHint,
  settingsSection,
  settingsSectionHeader,
  settingsSectionTitle,
  sourceSegment,
  sourceSegmentDetail,
  sourceSegments,
} from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function SourceSection({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");
  if (view.sourceOptions.length < 2) return null;
  const playing = view.chain.source?.key ?? null;

  return (
    <section className={settingsSection()} aria-label={t("settings.source.caption")}>
      <div className={settingsSectionHeader()}>
        <span className={settingsSectionTitle()}>{t("settings.source.caption")}</span>
      </div>
      <div className={sourceSegments()} role="radiogroup" aria-label={t("settings.source.caption")}>
        {view.sourceOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={option.key === playing}
            className={sourceSegment({ active: option.key === playing })}
            onClick={() => actions.setSource(option.key)}
          >
            {option.label}
            <span className={sourceSegmentDetail()}>{option.detail}</span>
          </button>
        ))}
      </div>
      <span className={settingsHint()}>{t("settings.source.hint")}</span>
    </section>
  );
}
