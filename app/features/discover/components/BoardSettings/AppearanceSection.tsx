"use client";

import { useTranslation } from "react-i18next";

import { SectionLoading } from "@components/ui/SectionLoading";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { useSetBoardAppearance } from "@hooks/api/mutations/board/useSetBoardAppearance";
import { useBoardAppearance } from "@hooks/api/queries/board/useBoardAppearance";

import { densityChoices, textScaleChoices } from "./helpers";
import { settingHint, settingLabel, settingRow, settingsSection, settingsTitle } from "./styles";

export function AppearanceSection() {
  const { t } = useTranslation("widgets");
  const appearance = useBoardAppearance().data;
  const setAppearance = useSetBoardAppearance();

  return (
    <section className={settingsSection()} aria-labelledby="board-appearance-title">
      <h3 id="board-appearance-title" className={settingsTitle()}>
        {t("board.appearance.title")}
      </h3>
      {appearance ? (
        <>
          <div className={settingRow()}>
            <span className={settingLabel()}>{t("board.appearance.density")}</span>
            <span className={settingHint()}>{t("board.appearance.densityHint")}</span>
            <SegmentTabs
              items={densityChoices().map((density) => ({
                value: density,
                label: t(`board.appearance.densities.${density}`),
              }))}
              value={appearance.density}
              onValueChange={(density) => setAppearance({ ...appearance, density })}
              layoutId="board-appearance-density"
              ariaLabel={t("board.appearance.density")}
            />
          </div>
          <div className={settingRow()}>
            <span className={settingLabel()}>{t("board.appearance.text")}</span>
            <span className={settingHint()}>{t("board.appearance.textHint")}</span>
            <SegmentTabs
              items={textScaleChoices().map((text) => ({ value: text, label: t(`board.appearance.texts.${text}`) }))}
              value={appearance.text}
              onValueChange={(text) => setAppearance({ ...appearance, text })}
              layoutId="board-appearance-text"
              ariaLabel={t("board.appearance.text")}
            />
          </div>
        </>
      ) : (
        <SectionLoading />
      )}
    </section>
  );
}
