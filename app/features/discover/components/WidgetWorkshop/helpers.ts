import i18n from "@locale";

import { BOARD_GAP_PX, BOARD_ROW_PX, BOARD_SPANS } from "@components/BoardGrid";
import type { BoardSize } from "@hooks/api/queries/board/types";
import { matchesTerms, searchTerms } from "@utils/search";
import type {
  FeedQuery,
  HouseholdMember,
  QuestionQuery,
  RecapPeriod,
  RecapQuery,
  WidgetBlock,
  WidgetCatalog,
  WidgetDraft,
  WidgetGrammar,
  WidgetPreset,
  WidgetQuery,
  WidgetShape,
} from "@hooks/api/queries/widgets/types";

import { acceptedBlocks, suggestBlocks } from "../CustomWidget/helpers";
import type { BlockSuggestionInput } from "../CustomWidget/types";
import { CUSTOM_BLOCK_HEIGHTS } from "../ExploreBoard/constants";
import { compactCount, percentOf } from "../helpers";
import {
  DAILY_YEAR_MIN_DAYS,
  DEFAULT_DAYS,
  DEFAULT_FEED_SEED,
  DEFAULT_FRESH_RELEASE_DAYS,
  DEFAULT_CURATED_FEED,
  DEFAULT_EVENTS_DAYS,
  DEFAULT_FEED_SHAPE,
  DEFAULT_LIDARR_CALENDAR_DAYS,
  DEFAULT_LISTENBRAINZ_PLAYLIST,
  DEFAULT_MEDIA_SERVER,
  DEFAULT_NEWS_URL,
  DEFAULT_RULES,
  MONTH_DAYS,
  MONTH_NAME_REFERENCE_YEAR,
  NAMED_PERIOD_DAYS,
  NO_ROTATION,
  YEAR_DAYS,
} from "./constants";
import type {
  CatalogFeedSource,
  FeedBase,
  FeedDefaults,
  FeedSeed,
  FeedSeedKind,
  FeedSource,
  GrammarSubject,
  MediaServer,
  PickRotation,
  QuestionMeasure,
  RecapNamedPeriod,
  QuestionSubject,
  QuestionTime,
  RuleField,
  RuleList,
  RuleMode,
  TimeMode,
  ViewChoice,
  WidgetKind,
  WidgetRule,
  WidgetRules,
} from "./types";

export function questionShapeOf(question: QuestionQuery, grammar: WidgetGrammar): WidgetShape {
  if (question.groupBy !== undefined) return grammar.groupByShapes[question.groupBy];
  const shapes = grammar.subjectShapes[question.subject];
  return question.pick.limit === grammar.pick.limitMin ? shapes.single : shapes.many;
}

function queryShapeOf(query: WidgetQuery, catalog: WidgetCatalog, grammar: WidgetGrammar): WidgetShape {
  switch (query.type) {
    case "question":
      return questionShapeOf(query, grammar);
    case "feed":
      return feedSourceOf(catalog, query.source)?.shape ?? DEFAULT_FEED_SHAPE;
    case "recap":
      return catalog.recap.shape;
  }
}

export function webUrlOf(text: string): string | null {
  const trimmed = text.trim();
  if (!URL.canParse(trimmed)) return null;
  const { protocol } = new URL(trimmed);
  return protocol === "http:" || protocol === "https:" ? trimmed : null;
}

export function listsTracksOf(query: WidgetQuery): boolean {
  return query.type === "question" && query.subject === "tracks" && query.groupBy === undefined;
}

export function withFittingPlaylist(draft: WidgetDraft): WidgetDraft {
  return draft.playlist && !listsTracksOf(draft.query) ? { ...draft, playlist: null } : draft;
}

export function kindOf(query: WidgetQuery): WidgetKind {
  return query.type === "feed" ? "feed" : "question";
}

export function recapPeriodFrom(time: QuestionTime, periods: readonly RecapNamedPeriod[]): RecapPeriod {
  if (time.mode === "absolute") return time;
  const [first = "thisYear"] = periods;
  const named = time.mode === "named" ? periods.find((period) => period === time.value) : undefined;
  return { mode: "named", value: named ?? first };
}

export function recapReadbackOf(recap: RecapQuery): string {
  return i18n.t("widgets:readback.recap", { time: timeText(recap.period) });
}

export function rotationChoicesOf(grammar: WidgetGrammar): PickRotation[] {
  return [NO_ROTATION, ...grammar.pick.rotations];
}

function comparesOf(query: WidgetQuery): boolean {
  return query.type === "question" && query.compare === "previous";
}

function windowDaysOf(time: QuestionTime): number {
  switch (time.mode) {
    case "relative":
    case "sameLastYear":
      return time.days;
    case "named":
      return NAMED_PERIOD_DAYS[time.value];
    case "absolute":
      return time.month === undefined ? YEAR_DAYS : MONTH_DAYS;
  }
}

export function dailyYearOf(query: WidgetQuery): boolean {
  return query.type === "question" && query.groupBy === "day" && windowDaysOf(query.time) >= DAILY_YEAR_MIN_DAYS;
}

function suggestionInputOf(query: WidgetQuery, catalog: WidgetCatalog, grammar: WidgetGrammar): BlockSuggestionInput {
  return { shape: queryShapeOf(query, catalog, grammar), compare: comparesOf(query), dailyYear: dailyYearOf(query) };
}

export function fittingBlocksOf(query: WidgetQuery, catalog: WidgetCatalog, grammar: WidgetGrammar): WidgetBlock[] {
  return suggestBlocks(catalog.blocks, suggestionInputOf(query, catalog, grammar));
}

export function acceptedBlocksOf(query: WidgetQuery, catalog: WidgetCatalog, grammar: WidgetGrammar): WidgetBlock[] {
  return acceptedBlocks(catalog.blocks, suggestionInputOf(query, catalog, grammar));
}

export function withFittingView(draft: WidgetDraft, catalog: WidgetCatalog, grammar: WidgetGrammar): WidgetDraft {
  if (acceptedBlocksOf(draft.query, catalog, grammar).includes(draft.view.block)) return draft;
  const [first] = fittingBlocksOf(draft.query, catalog, grammar);
  return first ? { ...draft, view: { ...draft.view, block: first } } : draft;
}

export function grammarSubjectOf(grammar: WidgetGrammar, subject: QuestionSubject): GrammarSubject | undefined {
  return grammar.subjects.find((entry) => entry.key === subject);
}

export function ruleListOf(rules: WidgetRules | undefined): RuleList {
  if (rules?.any) return { mode: "any", list: rules.any };
  return { mode: "all", list: rules?.all ?? [] };
}

export function rulesFrom(mode: RuleMode, list: readonly WidgetRule[]): WidgetRules | undefined {
  if (list.length === 0) return undefined;
  return mode === "all" ? { all: [...list] } : { any: [...list] };
}

export function ruleFieldsOf(grammar: WidgetGrammar, subject: QuestionSubject): RuleField[] {
  return grammarSubjectOf(grammar, subject)?.rules.map((rule) => rule.field) ?? [];
}

export function canGroupBy(grammar: WidgetGrammar, question: QuestionQuery): boolean {
  const entry = grammarSubjectOf(grammar, question.subject);
  return (entry?.groupBy.length ?? 0) > 0 && grammar.groupByMeasures.includes(question.measure);
}

function reconciled(question: QuestionQuery, grammar: WidgetGrammar): QuestionQuery {
  const fields = ruleFieldsOf(grammar, question.subject);
  const { mode, list } = ruleListOf(question.rules);
  return {
    ...question,
    rules: rulesFrom(
      mode,
      list.filter((rule) => fields.includes(rule.field))
    ),
    groupBy: canGroupBy(grammar, question) ? question.groupBy : undefined,
    compare: question.measure === "rankDelta" ? "previous" : question.compare,
    pick: { ...question.pick, by: question.pick.by === "name" ? "name" : question.measure },
  };
}

export function withSubject(question: QuestionQuery, subject: QuestionSubject, grammar: WidgetGrammar): QuestionQuery {
  const measures = grammarSubjectOf(grammar, subject)?.measures ?? [];
  const measure = measures.includes(question.measure) ? question.measure : (measures[0] ?? question.measure);
  return reconciled({ ...question, subject, measure }, grammar);
}

export function withMeasure(question: QuestionQuery, measure: QuestionMeasure, grammar: WidgetGrammar): QuestionQuery {
  return reconciled({ ...question, measure }, grammar);
}

export function timeFor(mode: TimeMode, now: Date): QuestionTime {
  switch (mode) {
    case "relative":
      return { mode, days: DEFAULT_DAYS };
    case "named":
      return { mode, value: "thisMonth" };
    case "absolute":
      return { mode, year: now.getFullYear() };
    case "sameLastYear":
      return { mode, days: DEFAULT_DAYS };
  }
}

export function rotationOf(question: QuestionQuery): PickRotation {
  return question.pick.random?.rotate ?? NO_ROTATION;
}

export function withRotation(question: QuestionQuery, rotation: PickRotation): QuestionQuery {
  return { ...question, pick: { ...question.pick, random: rotation === NO_ROTATION ? null : { rotate: rotation } } };
}

export function defaultRuleFor(field: RuleField): WidgetRule {
  return DEFAULT_RULES[field];
}

function yesNo(value: boolean): "true" | "false" {
  return value ? "true" : "false";
}

export function personName(value: string, people: readonly HouseholdMember[]): string {
  if (value === "me") return i18n.t("widgets:rules.people.me");
  if (value === "household") return i18n.t("widgets:rules.people.household");
  return people.find((person) => person.id === value)?.name ?? i18n.t("widgets:rules.people.someone");
}

export function ruleText(rule: WidgetRule, people: readonly HouseholdMember[] = []): string {
  switch (rule.field) {
    case "user":
      return i18n.t(`widgets:rules.text.user_${rule.op}`, { value: personName(rule.value, people) });
    case "plays":
      return i18n.t(`widgets:rules.text.plays_${rule.op}`, { value: rule.value });
    case "notPlayedInLast":
      return i18n.t("widgets:rules.text.notPlayedInLast", { value: rule.value });
    case "addedOlderThan":
      return i18n.t("widgets:rules.text.addedOlderThan", { value: rule.value });
    case "bitrate":
      return i18n.t(`widgets:rules.text.bitrate_${rule.op}`, { value: rule.value });
    case "ownedShare":
      return i18n.t(`widgets:rules.text.ownedShare_${rule.op}`, { value: percentOf(rule.value) });
    case "favorite":
      return i18n.t(`widgets:rules.text.favorite_${yesNo(rule.value)}`);
    case "inLibrary":
      return i18n.t(`widgets:rules.text.inLibrary_${yesNo(rule.value)}`);
    case "artistInLibrary":
      return i18n.t(`widgets:rules.text.artistInLibrary_${yesNo(rule.value)}`);
    case "requestStatus":
      return i18n.t("widgets:rules.text.requestStatus", { value: i18n.t(`status:request.${rule.value}.label`) });
    case "genre":
      return i18n.t("widgets:rules.text.genre", { value: rule.value });
    case "decade":
      return rule.value === "myTop"
        ? i18n.t("widgets:rules.text.decadeMyTop")
        : i18n.t("widgets:rules.text.decade", { value: i18n.t("discover:customWidget.decade", { year: rule.value }) });
    case "artistInMyTop":
      return i18n.t("widgets:rules.text.artistInMyTop", { n: rule.value.n, days: rule.value.days });
    case "inCurrentTimeSlot":
      return i18n.t("widgets:rules.text.inCurrentTimeSlot");
    case "releaseType":
      return i18n.t(`widgets:rules.text.releaseType_${rule.op}`, {
        value: i18n.t(`widgets:rules.releaseTypes.${rule.value}`),
      });
    case "listeners":
      return i18n.t(`widgets:rules.text.listeners_${rule.op}`, { value: compactCount(rule.value) });
  }
}

export function monthName(month: number): string {
  return new Date(MONTH_NAME_REFERENCE_YEAR, month - 1, 1).toLocaleDateString(i18n.language, { month: "long" });
}

function timeText(time: QuestionTime): string {
  switch (time.mode) {
    case "relative":
      return i18n.t("widgets:time.relative", { count: time.days });
    case "named":
      return i18n.t(`widgets:periods.${time.value}`);
    case "absolute":
      return time.month === undefined
        ? i18n.t("widgets:time.absoluteYear", { year: time.year })
        : i18n.t("widgets:time.absoluteMonth", { month: monthName(time.month), year: time.year });
    case "sameLastYear":
      return i18n.t("widgets:time.sameLastYear", { count: time.days });
  }
}

function headOf(question: QuestionQuery): string {
  const measure = i18n.t(`widgets:measures.${question.measure}`);
  const time = timeText(question.time);
  if (question.groupBy) {
    return i18n.t("widgets:readback.series", { measure, time, unit: i18n.t(`widgets:units.${question.groupBy}`) });
  }
  const parts = {
    count: question.pick.limit,
    subject: i18n.t(`widgets:subjects.${question.subject}`),
    order: i18n.t(`widgets:orders.${question.pick.order}`),
    measure,
    time,
  };
  const rotation = question.pick.random?.rotate;
  return rotation
    ? i18n.t("widgets:readback.pick", { ...parts, rotation: i18n.t(`widgets:readback.${rotation}`) })
    : i18n.t("widgets:readback.show", parts);
}

export function readbackOf(question: QuestionQuery, people: readonly HouseholdMember[] = []): string {
  const { mode, list } = ruleListOf(question.rules);
  const joiner = i18n.t(mode === "all" ? "widgets:readback.and" : "widgets:readback.or");
  const rules = list.map((rule) => ruleText(rule, people)).join(joiner);
  return [
    headOf(question),
    question.compare === "previous" ? i18n.t("widgets:readback.compared") : "",
    list.length > 0 ? i18n.t("widgets:readback.where", { rules }) : "",
    i18n.t("widgets:readback.end"),
  ].join("");
}

export function feedSourceOf(catalog: WidgetCatalog, source: FeedSource): CatalogFeedSource | undefined {
  return catalog.feeds.sources.find((entry) => entry.key === source);
}

export function feedSeedOf(feed: FeedQuery): FeedSeed | null {
  switch (feed.source) {
    case "lastfm.similarArtists":
    case "lastfm.similarTracks":
    case "catalog.related":
    case "catalog.artistAlbums":
    case "events.upcoming":
      return feed.params.seed;
    case "listenbrainz.recommendations":
    case "listenbrainz.freshReleases":
    case "listenbrainz.playlists":
    case "catalog.trending":
    case "lastfm.charts":
    case "lastfm.lovedTracks":
    case "feed.rss":
    case "feed.curated":
    case "mediaServer.recentlyAdded":
    case "mediaServer.mostPlayed":
    case "mediaServer.nowPlaying":
    case "mediaServer.playlists":
    case "lidarr.calendar":
    case "lidarr.wanted":
      return null;
  }
}

export function feedServerOf(feed: FeedQuery): MediaServer | null {
  switch (feed.source) {
    case "mediaServer.recentlyAdded":
    case "mediaServer.mostPlayed":
    case "mediaServer.nowPlaying":
    case "mediaServer.playlists":
      return feed.params.server;
    case "lastfm.similarArtists":
    case "lastfm.similarTracks":
    case "catalog.related":
    case "catalog.artistAlbums":
    case "events.upcoming":
    case "listenbrainz.recommendations":
    case "listenbrainz.freshReleases":
    case "listenbrainz.playlists":
    case "catalog.trending":
    case "lastfm.charts":
    case "lastfm.lovedTracks":
    case "feed.rss":
    case "feed.curated":
    case "lidarr.calendar":
    case "lidarr.wanted":
      return null;
  }
}

function feedWithSource(base: FeedBase, source: FeedSource, defaults: FeedDefaults): FeedQuery {
  const { seed, country, server } = defaults;
  switch (source) {
    case "lastfm.similarArtists":
    case "lastfm.similarTracks":
    case "catalog.related":
    case "catalog.artistAlbums":
      return { ...base, source, params: { seed } };
    case "listenbrainz.recommendations":
    case "catalog.trending":
    case "lastfm.lovedTracks":
      return { ...base, source, params: {} };
    case "listenbrainz.freshReleases":
      return { ...base, source, params: { days: DEFAULT_FRESH_RELEASE_DAYS } };
    case "listenbrainz.playlists":
      return { ...base, source, params: { playlist: DEFAULT_LISTENBRAINZ_PLAYLIST } };
    case "lastfm.charts":
      return { ...base, source, params: { country } };
    case "feed.rss":
      return { ...base, source, params: { url: DEFAULT_NEWS_URL } };
    case "feed.curated":
      return { ...base, source, params: { feed: DEFAULT_CURATED_FEED } };
    case "events.upcoming":
      return { ...base, source, params: { seed, country: null, days: DEFAULT_EVENTS_DAYS } };
    case "mediaServer.recentlyAdded":
    case "mediaServer.mostPlayed":
    case "mediaServer.nowPlaying":
    case "mediaServer.playlists":
      return { ...base, source, params: { server } };
    case "lidarr.calendar":
      return { ...base, source, params: { days: DEFAULT_LIDARR_CALENDAR_DAYS } };
    case "lidarr.wanted":
      return { ...base, source, params: {} };
  }
}

export function withSource(feed: FeedQuery, source: FeedSource, catalog: WidgetCatalog, country: string): FeedQuery {
  const entry = feedSourceOf(catalog, source);
  const fields = entry?.rules ?? [];
  const { mode, list } = ruleListOf(feed.rules);
  const by = entry?.pickBy.includes(feed.pick.by) ? feed.pick.by : "rank";
  const base: FeedBase = {
    type: "feed",
    rules: rulesFrom(
      mode,
      list.filter((rule) => fields.includes(rule.field))
    ),
    pick: { ...feed.pick, by },
  };
  return feedWithSource(base, source, {
    seed: feedSeedOf(feed) ?? DEFAULT_FEED_SEED,
    country,
    server: feedServerOf(feed) ?? catalog.feeds.defaultServer ?? DEFAULT_MEDIA_SERVER,
  });
}

export function withSeed(feed: FeedQuery, seed: FeedSeed): FeedQuery {
  switch (feed.source) {
    case "lastfm.similarArtists":
    case "lastfm.similarTracks":
    case "catalog.related":
    case "catalog.artistAlbums":
      return { ...feed, params: { seed } };
    case "events.upcoming":
      return { ...feed, params: { ...feed.params, seed } };
    case "listenbrainz.recommendations":
    case "listenbrainz.freshReleases":
    case "listenbrainz.playlists":
    case "catalog.trending":
    case "lastfm.charts":
    case "lastfm.lovedTracks":
    case "feed.rss":
    case "feed.curated":
    case "mediaServer.recentlyAdded":
    case "mediaServer.mostPlayed":
    case "mediaServer.nowPlaying":
    case "mediaServer.playlists":
    case "lidarr.calendar":
    case "lidarr.wanted":
      return feed;
  }
}

export function serverChoicesOf(catalog: WidgetCatalog, chosen: MediaServer): MediaServer[] {
  const connected = catalog.feeds.servers;
  return connected.includes(chosen) ? [...connected] : [...connected, chosen];
}

export function withServer(feed: FeedQuery, server: MediaServer): FeedQuery {
  switch (feed.source) {
    case "mediaServer.recentlyAdded":
    case "mediaServer.mostPlayed":
    case "mediaServer.nowPlaying":
    case "mediaServer.playlists":
      return { ...feed, params: { server } };
    case "lastfm.similarArtists":
    case "lastfm.similarTracks":
    case "catalog.related":
    case "catalog.artistAlbums":
    case "events.upcoming":
    case "listenbrainz.recommendations":
    case "listenbrainz.freshReleases":
    case "listenbrainz.playlists":
    case "catalog.trending":
    case "lastfm.charts":
    case "lastfm.lovedTracks":
    case "feed.rss":
    case "feed.curated":
    case "lidarr.calendar":
    case "lidarr.wanted":
      return feed;
  }
}

export function seedFor(kind: FeedSeedKind, current: FeedSeed | null): FeedSeed {
  if (current?.kind === kind) return current;
  switch (kind) {
    case "myTopArtists":
      return DEFAULT_FEED_SEED;
    case "favorites":
      return { kind };
  }
}

export function feedReadbackOf(feed: FeedQuery): string {
  const { mode, list } = ruleListOf(feed.rules);
  const joiner = i18n.t(mode === "all" ? "widgets:readback.and" : "widgets:readback.or");
  return [
    i18n.t("widgets:readback.feed", {
      count: feed.pick.limit,
      source: i18n.t(`widgets:feeds.sources.${feed.source}`),
    }),
    list.length > 0 ? i18n.t("widgets:readback.where", { rules: list.map((rule) => ruleText(rule)).join(joiner) }) : "",
    i18n.t("widgets:readback.end"),
  ].join("");
}

export function viewChoicesOf(
  catalog: WidgetCatalog,
  blocks: { fitting: readonly WidgetBlock[]; accepted: readonly WidgetBlock[] },
  current: WidgetBlock,
  showAll: boolean
): ViewChoice[] {
  const keptCurrent = !blocks.fitting.includes(current) && blocks.accepted.includes(current) ? [current] : [];
  const shown = [...blocks.fitting, ...keptCurrent];
  const fits = shown.map((block, index) => ({
    block,
    fits: true,
    suggested: index === 0 && blocks.fitting.length > 0,
  }));
  if (!showAll) return fits;
  const rest = catalog.blocks
    .map((entry) => entry.key)
    .filter((block) => !shown.includes(block))
    .map((block) => ({ block, fits: blocks.accepted.includes(block), suggested: false }));
  return [...fits, ...rest];
}

export function previewHeightOf(block: WidgetBlock, size: BoardSize): number {
  const { rows } = BOARD_SPANS.wide[size][CUSTOM_BLOCK_HEIGHTS[block][size]];
  return rows * BOARD_ROW_PX + (rows - 1) * BOARD_GAP_PX;
}

export function previewableDraft(draft: WidgetDraft, fallbackName: string): WidgetDraft {
  if (draft.meta.name.trim().length > 0) return draft;
  return { ...draft, meta: { ...draft.meta, name: fallbackName } };
}

export function draftKeyOf(draft: WidgetDraft): string {
  return JSON.stringify(draft);
}

export function presetDraftOf(preset: WidgetPreset, name: string): WidgetDraft {
  return { ...preset.draft, meta: { ...preset.draft.meta, name } };
}

export function clampedNumber(raw: string, min: number, max: number): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function matchingIcons<T extends string>(icons: readonly T[], query: string): T[] {
  const terms = searchTerms(query);
  return terms.length > 0 ? icons.filter((icon) => matchesTerms(terms, [icon])) : [...icons];
}
