"use client";

import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { SegmentTabs } from "@components/ui/SegmentTabs";

import { widgetIconOf } from "../CustomWidget/helpers";
import { WIDGET_KINDS } from "./constants";
import { FeedSteps } from "./FeedSteps";
import { readbackOf } from "./helpers";
import { RecipeSteps } from "./RecipeSteps";
import {
  kindLabel,
  kindSwitch,
  presetChip,
  readback,
  section,
  sectionHead,
  sectionHelp,
  sectionNumber,
  sectionTitle,
  startFromLabel,
  startFromList,
  startFromRow,
} from "./styles";
import type { WorkshopSectionProps } from "./types";

export function QuerySection({ workshop, context }: WorkshopSectionProps) {
  const { t } = useTranslation("widgets");
  const { query } = workshop.draft;

  return (
    <section className={section()} aria-labelledby="workshop-query-title">
      <div className={sectionHead()}>
        <span className={sectionNumber()}>1</span>
        <h3 id="workshop-query-title" className={sectionTitle()}>
          {t(`kinds.${query.type}`)}
        </h3>
        <div className={kindSwitch()}>
          <span className={kindLabel()}>{t("workshop.buildUsing")}</span>
          <SegmentTabs
            items={WIDGET_KINDS.map((kind) => ({ value: kind, label: t(`kinds.${kind}`) }))}
            value={query.type}
            onValueChange={workshop.setKind}
            layoutId="widget-workshop-kind"
            ariaLabel={t("workshop.kindLabel")}
          />
        </div>
      </div>
      <p className={sectionHelp()}>{query.type === "question" ? t("workshop.recipeHelp") : t("workshop.feedHelp")}</p>
      {query.type === "question" ? (
        <>
          <div className={startFromRow()}>
            <span className={startFromLabel()}>{t("workshop.startFrom")}</span>
            <FadeScroll axis="x" label={t("workshop.startFrom")}>
              <div className={startFromList()}>
                {context.presets
                  .filter((preset) => preset.startFrom)
                  .map((preset) => {
                    const Icon = widgetIconOf(preset.draft.meta.icon);
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        className={presetChip()}
                        onClick={() => workshop.applyPreset(preset)}
                      >
                        <Icon aria-hidden />
                        {t(`presets.${preset.key}`)}
                      </button>
                    );
                  })}
              </div>
            </FadeScroll>
          </div>
          <RecipeSteps workshop={workshop} question={query} grammar={context.grammar} />
          <p className={readback()} aria-live="polite">
            {readbackOf(query)}
          </p>
        </>
      ) : (
        <FeedSteps workshop={workshop} feed={query} context={context} />
      )}
    </section>
  );
}
