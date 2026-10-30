"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { SelectMenu } from "@components/ui/SelectMenu";
import { COUNTRIES } from "@utils/countries";

import { ANY_COUNTRY, FEED_SEED_KINDS, NO_ROTATION, NUMBER_BOUNDS } from "./constants";
import {
  defaultRuleFor,
  rotationChoicesOf,
  feedReadbackOf,
  feedSeedOf,
  feedSourceOf,
  ruleListOf,
  seedFor,
  withSeed,
  withSource,
} from "./helpers";
import { NewsUrlField } from "./NewsUrlField";
import { NumberField } from "./NumberField";
import { StepRow } from "./StepRow";
import { addRow, readback, stepList, stepText } from "./styles";
import type { FeedStepsProps } from "./types";
import { WhereStep } from "./WhereStep";

export function FeedSteps({ workshop, feed, context }: FeedStepsProps) {
  const { t } = useTranslation("widgets");
  const { catalog, grammar, country } = context;
  const source = feedSourceOf(catalog, feed.source);
  const fields = source?.rules ?? [];
  const rules = ruleListOf(feed.rules);
  const seed = feedSeedOf(feed);
  const showWhere = rules.list.length > 0 || workshop.ruleDraft !== null;
  const [firstField] = fields;
  const limits = { daysMax: grammar.limits.daysMax, topNMax: grammar.limits.topNMax };
  const rotation = feed.pick.random?.rotate ?? NO_ROTATION;

  return (
    <>
      <div className={stepList()}>
        <StepRow label={t("steps.source")}>
          <SelectMenu
            ariaLabel={t("steps.source")}
            value={feed.source}
            options={catalog.feeds.sources.map((entry) => ({
              value: entry.key,
              label: t(`feeds.sources.${entry.key}`),
              description: entry.integration ? t(`feeds.needs.${entry.integration}`) : undefined,
            }))}
            onChange={(next) => workshop.setQuery(withSource(feed, next, catalog, country))}
          />
        </StepRow>
        {seed ? (
          <StepRow label={t("steps.seed")}>
            <SelectMenu
              ariaLabel={t("steps.seed")}
              value={seed.kind === "favorites" ? "favorites" : "myTopArtists"}
              options={FEED_SEED_KINDS.map((kind) => ({ value: kind, label: t(`feeds.seeds.${kind}`) }))}
              onChange={(kind) => workshop.setQuery(withSeed(feed, seedFor(kind, seed)))}
            />
            {seed.kind === "myTopArtists" ? (
              <>
                <NumberField
                  label={t("rules.topN")}
                  value={seed.n}
                  min={NUMBER_BOUNDS.topNMin}
                  max={grammar.limits.topNMax}
                  onChange={(n) => workshop.setQuery(withSeed(feed, { ...seed, n }))}
                />
                <span className={stepText()}>{t("feeds.overDays")}</span>
                <NumberField
                  label={t("time.days")}
                  value={seed.days}
                  min={NUMBER_BOUNDS.daysMin}
                  max={grammar.limits.daysMax}
                  onChange={(days) => workshop.setQuery(withSeed(feed, { ...seed, days }))}
                />
              </>
            ) : null}
          </StepRow>
        ) : null}
        {feed.source === "listenbrainz.freshReleases" ? (
          <StepRow label={t("steps.params")}>
            <span className={stepText()}>{t("feeds.releasedInLast")}</span>
            <NumberField
              label={t("time.days")}
              value={feed.params.days}
              min={NUMBER_BOUNDS.daysMin}
              max={catalog.feeds.limits.freshReleaseDaysMax}
              onChange={(days) => workshop.setQuery({ ...feed, params: { days } })}
            />
            <span className={stepText()}>{t("time.days")}</span>
          </StepRow>
        ) : null}
        {feed.source === "listenbrainz.playlists" ? (
          <StepRow label={t("steps.params")}>
            <SelectMenu
              ariaLabel={t("feeds.playlist")}
              value={feed.params.playlist}
              options={catalog.feeds.playlists.map((playlist) => ({
                value: playlist,
                label: t(`feeds.playlists.${playlist}`),
              }))}
              onChange={(playlist) => workshop.setQuery({ ...feed, params: { playlist } })}
            />
          </StepRow>
        ) : null}
        {feed.source === "lastfm.charts" ? (
          <StepRow label={t("steps.params")}>
            <SelectMenu
              ariaLabel={t("feeds.country")}
              value={feed.params.country}
              options={COUNTRIES.map((country) => ({ value: country.code, label: country.name }))}
              onChange={(country) => workshop.setQuery({ ...feed, params: { country } })}
            />
          </StepRow>
        ) : null}
        {feed.source === "events.upcoming" ? (
          <StepRow label={t("steps.params")}>
            <SelectMenu
              ariaLabel={t("feeds.country")}
              value={feed.params.country ?? ANY_COUNTRY}
              options={[
                { value: ANY_COUNTRY, label: t("feeds.anywhere") },
                ...COUNTRIES.map((country) => ({ value: country.code, label: country.name })),
              ]}
              onChange={(country) =>
                workshop.setQuery({
                  ...feed,
                  params: { ...feed.params, country: country === ANY_COUNTRY ? null : country },
                })
              }
            />
            <span className={stepText()}>{t("feeds.showsWithin")}</span>
            <NumberField
              label={t("time.days")}
              value={feed.params.days}
              min={NUMBER_BOUNDS.daysMin}
              max={catalog.feeds.limits.eventsDaysMax}
              onChange={(days) => workshop.setQuery({ ...feed, params: { ...feed.params, days } })}
            />
            <span className={stepText()}>{t("time.days")}</span>
          </StepRow>
        ) : null}
        {feed.source === "feed.rss" ? (
          <StepRow label={t("steps.params")}>
            <NewsUrlField
              key={feed.params.url}
              url={feed.params.url}
              onCommit={(url) => workshop.setQuery({ ...feed, params: { url } })}
            />
          </StepRow>
        ) : null}
        {feed.source === "feed.curated" ? (
          <StepRow label={t("steps.params")}>
            <SelectMenu
              ariaLabel={t("feeds.curatedLabel")}
              value={feed.params.feed}
              options={catalog.feeds.curated.map((entry) => ({ value: entry, label: t(`feeds.curated.${entry}`) }))}
              onChange={(entry) => workshop.setQuery({ ...feed, params: { feed: entry } })}
            />
          </StepRow>
        ) : null}
        <StepRow label={t("steps.show")}>
          <NumberField
            label={t("steps.limitNamed")}
            value={feed.pick.limit}
            min={grammar.pick.limitMin}
            max={grammar.pick.limitMax}
            onChange={(limit) => workshop.setQuery({ ...feed, pick: { ...feed.pick, limit } })}
          />
          <span className={stepText()}>{t("feeds.items")}</span>
        </StepRow>
        <StepRow label={t("steps.pickBy")}>
          <SelectMenu
            ariaLabel={t("steps.pickBy")}
            value={feed.pick.by}
            options={(source?.pickBy ?? []).map((by) => ({ value: by, label: t(`feeds.pickBy.${by}`) }))}
            onChange={(by) => workshop.setQuery({ ...feed, pick: { ...feed.pick, by } })}
          />
          <SelectMenu
            ariaLabel={t("steps.measure")}
            value={feed.pick.order}
            options={grammar.pick.orders.map((order) => ({ value: order, label: t(`feeds.orders.${order}`) }))}
            onChange={(order) => workshop.setQuery({ ...feed, pick: { ...feed.pick, order } })}
          />
          <SelectMenu
            ariaLabel={t("steps.random")}
            value={rotation}
            options={rotationChoicesOf(grammar).map((entry) => ({ value: entry, label: t(`rotations.${entry}`) }))}
            onChange={(next) =>
              workshop.setQuery({
                ...feed,
                pick: { ...feed.pick, random: next === NO_ROTATION ? null : { rotate: next } },
              })
            }
          />
        </StepRow>
        {showWhere ? (
          <WhereStep workshop={workshop} rules={rules} fields={fields} limits={limits} people={context.people} />
        ) : null}
        {!showWhere && firstField ? (
          <div className={addRow()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => workshop.openRule({ kind: "new" }, defaultRuleFor(firstField))}
            >
              <Plus />
              {t("steps.add.where")}
            </Button>
          </div>
        ) : null}
      </div>
      <p className={readback()} aria-live="polite">
        {feedReadbackOf(feed)}
      </p>
    </>
  );
}
