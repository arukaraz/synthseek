"use client";

import { useTranslation } from "react-i18next";

import { SectionLoading } from "@components/ui/SectionLoading";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { SettingsField } from "@features/settings/components/SettingsField";
import { settingsCard } from "@features/settings/styles";

import { densityChoices, textScaleChoices } from "./helpers";
import type { AppearancePanelProps } from "./types";

export function AppearancePanel({ appearance, onAppearance, background, onBackground }: AppearancePanelProps) {
  const { t } = useTranslation("widgets");

  return (
    <section className={settingsCard()} aria-label={t("board.appearance.title")}>
      {appearance ? (
        <>
          <SettingsField label={t("board.appearance.density")}>
            <SegmentedControl
              options={densityChoices().map((density) => ({
                value: density,
                label: t(`board.appearance.densities.${density}`),
              }))}
              value={appearance.density}
              onChange={(density) => onAppearance({ ...appearance, density })}
              ariaLabel={t("board.appearance.density")}
            />
          </SettingsField>
          <SettingsField label={t("board.appearance.text")}>
            <SegmentedControl
              options={textScaleChoices().map((text) => ({
                value: text,
                label: t(`board.appearance.texts.${text}`),
              }))}
              value={appearance.text}
              onChange={(text) => onAppearance({ ...appearance, text })}
              ariaLabel={t("board.appearance.text")}
            />
          </SettingsField>
        </>
      ) : (
        <SectionLoading />
      )}
      <SettingsField label={t("board.appearance.background")}>
        <SegmentedControl
          options={[
            { value: "on", label: t("board.appearance.backgrounds.on") },
            { value: "off", label: t("board.appearance.backgrounds.off") },
          ]}
          value={background}
          onChange={(choice) => onBackground(choice === "on")}
          ariaLabel={t("board.appearance.background")}
        />
      </SettingsField>
    </section>
  );
}
