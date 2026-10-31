"use client";

import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";

import { widgetIconOf } from "../CustomWidget/helpers";
import { FeedSteps } from "./FeedSteps";
import { readbackOf, recapReadbackOf, startsFrom } from "./helpers";
import { PlaylistSteps } from "./PlaylistSteps/PlaylistSteps";
import { RecapSteps } from "./RecapSteps";
import { RecipeSteps } from "./RecipeSteps";
import {
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

export function QuerySection({ workshop, context, preview }: WorkshopSectionProps) {
  const { t } = useTranslation("widgets");
  const { query } = workshop.draft;

  return (
    <section className={section()} aria-labelledby="workshop-query-title">
      <div className={sectionHead()}>
        <span className={sectionNumber()}>1</span>
        <h3 id="workshop-query-title" className={sectionTitle()}>
          {t(`kinds.${workshop.kind}`)}
        </h3>
      </div>
      {query.type === "playlists" ? null : (
        <p className={sectionHelp()}>
          {workshop.kind === "recipe" ? t("workshop.recipeHelp") : t("workshop.feedHelp")}
        </p>
      )}
      {query.type === "feed" ? (
        <FeedSteps workshop={workshop} feed={query} context={context} />
      ) : (
        <>
          <div className={startFromRow()}>
            <span className={startFromLabel()}>{t("workshop.startFrom")}</span>
            <FadeScroll axis="x" label={t("workshop.startFrom")}>
              <div className={startFromList()}>
                {context.presets
                  .filter((preset) => startsFrom(preset, query))
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
          {query.type === "playlists" ? (
            <PlaylistSteps workshop={workshop} set={query} context={context} preview={preview} />
          ) : null}
          {query.type === "recipe" ? (
            <RecipeSteps workshop={workshop} recipe={query} grammar={context.grammar} people={context.people} />
          ) : null}
          {query.type === "recap" ? <RecapSteps workshop={workshop} recap={query} context={context} /> : null}
          {query.type === "playlists" ? null : (
            <p className={readback()} aria-live="polite">
              {query.type === "recipe" ? readbackOf(query, context.people) : recapReadbackOf(query)}
            </p>
          )}
        </>
      )}
    </section>
  );
}
