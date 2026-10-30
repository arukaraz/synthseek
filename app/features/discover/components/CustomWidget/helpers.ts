import type { LucideIcon } from "lucide-react";

import i18n from "@locale";

import {
  albumRequestItem,
  albumTarget,
  artistRequestItem,
  artistTarget,
  playlistLibraryTarget,
  trackRequestItem,
} from "@features/content-detail";
import type {
  FeedWidgetResult,
  QuestionWidgetResult,
  WidgetAction,
  WidgetBindSlot,
  WidgetBlock,
  WidgetDocument,
  WidgetIcon,
  WidgetMeasure,
  WidgetResult,
  WidgetRowOf,
} from "@hooks/api/queries/widgets/types";
import { calendarDateOf, formatCalendarDate, formatRelativeTime, isoDayOf } from "@utils/formatters";
import { playbackServerName } from "@utils/playback-servers";

import { compactCount } from "../helpers";
import { storyCoversOf, storyNoteOf, storyPagesOf } from "../WidgetStory/helpers";
import { MATRIX_HOURS, MATRIX_WEEKDAYS, MONTH_KEY_LENGTH, SUGGESTED_BLOCKS, WIDGET_ICONS } from "./constants";
import type {
  BlockContractView,
  BlockSuggestionInput,
  CustomWidgetNoteInput,
  MoveDirection,
  WidgetHandlers,
  WidgetItem,
  WidgetItemControls,
  WidgetMove,
  WidgetPoint,
  WidgetStat,
  WidgetView,
} from "./types";

type Bind = WidgetDocument["view"]["bind"];
type QuestionTrack = WidgetRowOf<QuestionWidgetResult, "tracks">;
type QuestionAlbum = WidgetRowOf<QuestionWidgetResult, "albums">;
type QuestionArtist = WidgetRowOf<QuestionWidgetResult, "artists">;
type QuestionBucket = WidgetRowOf<QuestionWidgetResult, "buckets">;
type FeedTrack = WidgetRowOf<FeedWidgetResult, "tracks">;
type FeedAlbum = WidgetRowOf<FeedWidgetResult, "albums">;
type FeedArtist = WidgetRowOf<FeedWidgetResult, "artists">;
type FeedItem = WidgetRowOf<FeedWidgetResult, "items">;
type FeedEvent = WidgetRowOf<FeedWidgetResult, "events">;
type FeedPlaylist = WidgetRowOf<FeedWidgetResult, "playlists">;

export function widgetIconOf(name: WidgetIcon): LucideIcon {
  return WIDGET_ICONS[name];
}

function fieldValue(row: object, field: string | undefined): unknown {
  if (field === undefined) return undefined;
  return Object.entries(row).find(([key]) => key === field)?.[1];
}

export function fieldText(row: object, field: string | undefined): string | null {
  const value = fieldValue(row, field);
  if (typeof value === "string") return value.length > 0 ? value : null;
  if (typeof value === "number") return compactCount(value);
  if (value instanceof Date) return formatRelativeTime(value);
  return null;
}

function bound(row: object, bind: Bind, slot: WidgetBindSlot, fallback: string | null): string | null {
  return fieldText(row, bind?.[slot]) ?? fallback;
}

function rankDeltaText(delta: number | null): string {
  if (delta === null) return i18n.t("discover:customWidget.value.new");
  if (delta === 0) return i18n.t("discover:customWidget.value.same");
  return delta > 0
    ? i18n.t("discover:customWidget.value.up", { count: delta })
    : i18n.t("discover:customWidget.value.down", { count: -delta });
}

export function measureText(measure: WidgetMeasure, value: number | null, when: Date | null): string | null {
  switch (measure) {
    case "plays":
      return value === null ? null : i18n.t("discover:customWidget.value.plays", { count: value });
    case "minutes":
      return value === null ? null : i18n.t("discover:customWidget.value.minutes", { count: Math.round(value) });
    case "distinctTracks":
      return value === null ? null : i18n.t("discover:customWidget.value.tracks", { count: value });
    case "lastPlayed":
    case "addedAt":
      return when ? formatRelativeTime(when) : null;
    case "rankDelta":
      return rankDeltaText(value);
  }
}

function dayOf(date: Date | null): string | null {
  return date ? isoDayOf(date) : null;
}

export function itemMeta(item: WidgetItem): string {
  return [item.subtitle, item.value].filter(Boolean).join(" · ");
}

export function calendarPartsOf(value: string | null): { month: string; day: string } | null {
  const date = value ? calendarDateOf(value) : null;
  if (!date) return null;
  return {
    month: date.toLocaleDateString(i18n.language, { month: "short" }),
    day: String(date.getDate()),
  };
}

function whenOf(measure: WidgetMeasure, row: { playedAt: Date | null; addedAt?: Date | null }): Date | null {
  return measure === "addedAt" ? (row.addedAt ?? null) : row.playedAt;
}

export function moveOf(
  measure: WidgetMeasure,
  row: { value: number | null; prev: number | null },
  compared: boolean
): WidgetMove | null {
  if (measure === "rankDelta") return row.value === null ? { kind: "new" } : { kind: "rank", by: row.value };
  if (!compared || row.value === null) return null;
  return row.prev === null ? { kind: "new" } : { kind: "value", by: row.value - row.prev };
}

function questionTrackItem(row: QuestionTrack, result: QuestionWidgetResult, bind: Bind): WidgetItem {
  const { measure } = result;
  return {
    key: row.id,
    title: bound(row, bind, "title", row.title) ?? row.title,
    subtitle: bound(row, bind, "subtitle", row.artist) ?? "",
    cover: bound(row, bind, "cover", row.cover),
    value: bound(row, bind, "value", measureText(measure, row.value, whenOf(measure, row))),
    date: dayOf(whenOf(measure, row) ?? row.playedAt),
    move: moveOf(measure, row, result.previous !== null),
    play: row.inLibrary ? { kind: "tracks", trackIds: [row.trackId] } : null,
    request: null,
    open: null,
    link: null,
  };
}

function questionAlbumItem(row: QuestionAlbum, result: QuestionWidgetResult, bind: Bind): WidgetItem {
  const { measure } = result;
  const album = { id: row.albumExternalId, name: row.name, artistName: row.artist, cover: row.cover };
  return {
    key: row.id,
    title: bound(row, bind, "title", row.name) ?? row.name,
    subtitle: bound(row, bind, "subtitle", row.artist) ?? "",
    cover: bound(row, bind, "cover", row.cover),
    value: bound(row, bind, "value", measureText(measure, row.value, whenOf(measure, row))),
    date: row.releaseDate.length > 0 ? row.releaseDate : null,
    move: moveOf(measure, row, result.previous !== null),
    play: row.inLibrary ? { kind: "album", albumExternalId: row.albumExternalId } : null,
    request: albumRequestItem(album),
    open: albumTarget(album),
    link: null,
  };
}

function questionArtistItem(row: QuestionArtist, result: QuestionWidgetResult, bind: Bind): WidgetItem {
  const { measure } = result;
  return {
    key: row.id,
    title: bound(row, bind, "title", row.name) ?? row.name,
    subtitle: bound(row, bind, "subtitle", i18n.t("discover:customWidget.value.tracks", { count: row.tracks })) ?? "",
    cover: bound(row, bind, "cover", row.cover),
    value: bound(row, bind, "value", measureText(measure, row.value, row.playedAt)),
    date: dayOf(row.playedAt),
    move: moveOf(measure, row, result.previous !== null),
    play: row.tracks > 0 ? { kind: "artist", artist: row.name } : null,
    request: null,
    open: null,
    link: null,
  };
}

function bucketLabel(result: QuestionWidgetResult, row: QuestionBucket): string {
  return result.subject === "decades" ? i18n.t("discover:customWidget.decade", { year: row.label }) : row.label;
}

function questionBucketItem(result: QuestionWidgetResult, row: QuestionBucket, bind: Bind): WidgetItem {
  return {
    key: row.key,
    title: bound(row, bind, "title", bucketLabel(result, row)) ?? row.label,
    subtitle: bound(row, bind, "subtitle", null) ?? "",
    cover: null,
    value: bound(row, bind, "value", measureText(result.measure, row.value, null)),
    date: null,
    move: moveOf(result.measure, row, result.previous !== null),
    play: null,
    request: null,
    open: null,
    link: null,
  };
}

function feedTrackItem(row: FeedTrack, bind: Bind): WidgetItem {
  const request = row.catalogTrackId
    ? trackRequestItem({
        id: row.catalogTrackId,
        title: row.title,
        artistName: row.artist,
        durationMs: row.durationMs ?? 0,
        trackNumber: 0,
        isrc: row.isrc,
        album: row.album ? { externalId: "", name: row.album, cover: row.cover } : null,
      })
    : null;
  return {
    key: row.id,
    title: bound(row, bind, "title", row.title) ?? row.title,
    subtitle: bound(row, bind, "subtitle", row.artist) ?? "",
    cover: bound(row, bind, "cover", row.cover),
    value: bound(row, bind, "value", row.plays > 0 ? measureText("plays", row.plays, null) : null),
    date: null,
    move: null,
    play: row.trackId ? { kind: "tracks", trackIds: [row.trackId] } : null,
    request,
    open: null,
    link: null,
  };
}

function feedAlbumItem(row: FeedAlbum, bind: Bind): WidgetItem {
  const album = row.catalogAlbumId
    ? { id: row.catalogAlbumId, name: row.name, artistName: row.artist, cover: row.cover }
    : null;
  return {
    key: row.id,
    title: bound(row, bind, "title", row.name) ?? row.name,
    subtitle: bound(row, bind, "subtitle", row.artist) ?? "",
    cover: bound(row, bind, "cover", row.cover),
    value: bound(row, bind, "value", formatCalendarDate(row.releaseDate)),
    date: row.releaseDate,
    move: null,
    play: row.inLibrary && row.catalogAlbumId ? { kind: "album", albumExternalId: row.catalogAlbumId } : null,
    request: album ? albumRequestItem(album) : null,
    open: album ? albumTarget(album) : null,
    link: null,
  };
}

function feedArtistItem(row: FeedArtist, bind: Bind): WidgetItem {
  const artist = row.catalogArtistId ? { id: row.catalogArtistId, name: row.name, cover: row.cover } : null;
  return {
    key: row.id,
    title: bound(row, bind, "title", row.name) ?? row.name,
    subtitle: bound(row, bind, "subtitle", null) ?? "",
    cover: bound(row, bind, "cover", row.cover),
    value: bound(row, bind, "value", row.plays > 0 ? measureText("plays", row.plays, null) : null),
    date: null,
    move: null,
    play: row.artistId ? { kind: "artist", artist: row.name } : null,
    request: artist ? artistRequestItem(artist) : null,
    open: artist ? artistTarget(artist) : null,
    link: null,
  };
}

function eventItem(row: FeedEvent, bind: Bind): WidgetItem {
  const place = [row.venue, row.city, row.country].filter((part) => part !== null && part.length > 0).join(" · ");
  return {
    key: row.id,
    title: bound(row, bind, "title", row.artist) ?? row.artist,
    subtitle: bound(row, bind, "subtitle", place) ?? "",
    cover: bound(row, bind, "cover", row.image),
    value: bound(row, bind, "value", formatCalendarDate(row.date)),
    date: dayOf(new Date(row.date)),
    move: null,
    play: null,
    request: null,
    open: null,
    link: row.url,
  };
}

function newsItem(row: FeedItem, bind: Bind): WidgetItem {
  const published = row.publishedAt ? new Date(row.publishedAt) : null;
  return {
    key: row.id,
    title: bound(row, bind, "title", row.title) ?? row.title,
    subtitle: bound(row, bind, "subtitle", row.summary) ?? "",
    cover: bound(row, bind, "cover", row.image),
    value: bound(row, bind, "value", row.source),
    date: dayOf(published),
    move: null,
    play: null,
    request: null,
    open: null,
    link: row.url,
  };
}

function serverPlaylistItem(row: FeedPlaylist, bind: Bind): WidgetItem {
  const tracks = row.tracks === null ? null : i18n.t("discover:serverPlaylists.tracks", { count: row.tracks });
  const subtitle = [tracks, playbackServerName(row.server)].filter((part) => part !== null).join(" · ");
  return {
    key: row.id,
    title: bound(row, bind, "title", row.name) ?? row.name,
    subtitle: bound(row, bind, "subtitle", subtitle) ?? "",
    cover: bound(row, bind, "cover", null),
    value: bound(row, bind, "value", null),
    date: null,
    move: null,
    play: row.playlistId ? { kind: "playlist", playlistId: row.playlistId } : null,
    request: null,
    open: row.playlistId ? playlistLibraryTarget({ id: row.playlistId, name: row.name, cover: null }) : null,
    link: null,
  };
}

function questionItems(result: QuestionWidgetResult, bind: Bind): WidgetItem[] {
  switch (result.dataset) {
    case "tracks":
      return result.rows.map((row) => questionTrackItem(row, result, bind));
    case "albums":
      return result.rows.map((row) => questionAlbumItem(row, result, bind));
    case "artists":
      return result.rows.map((row) => questionArtistItem(row, result, bind));
    case "buckets":
      return result.rows.map((row) => questionBucketItem(result, row, bind));
    case "series":
    case "matrix":
      return [];
  }
}

function feedItems(result: FeedWidgetResult, bind: Bind): WidgetItem[] {
  switch (result.dataset) {
    case "tracks":
      return result.rows.map((row) => feedTrackItem(row, bind));
    case "albums":
      return result.rows.map((row) => feedAlbumItem(row, bind));
    case "artists":
      return result.rows.map((row) => feedArtistItem(row, bind));
    case "items":
      return result.rows.map((row) => newsItem(row, bind));
    case "events":
      return result.rows.map((row) => eventItem(row, bind));
    case "playlists":
      return result.rows.map((row) => serverPlaylistItem(row, bind));
  }
}

export function widgetItemsOf(result: WidgetResult, bind: Bind): WidgetItem[] {
  switch (result.type) {
    case "question":
      return questionItems(result, bind);
    case "feed":
      return feedItems(result, bind);
    case "recap":
      return [];
  }
}

export function widgetStatsOf(result: WidgetResult): WidgetStat[] {
  if (result.type !== "question" || result.dataset !== "buckets") return [];
  return result.rows.map((row) => ({
    key: row.key,
    label: bucketLabel(result, row),
    value: row.value === null ? "" : compactCount(row.value),
    delta: row.value !== null && row.prev !== null ? row.value - row.prev : null,
  }));
}

function seriesLabel(key: string): string {
  const month = key.length === MONTH_KEY_LENGTH;
  const date = calendarDateOf(month ? `${key}-01` : key);
  if (!date) return key;
  return date.toLocaleDateString(
    i18n.language,
    month ? { month: "short", year: "numeric" } : { month: "short", day: "numeric" }
  );
}

function pointText(measure: WidgetMeasure, value: number): string {
  return measureText(measure, value, null) ?? compactCount(value);
}

export function widgetPointsOf(result: WidgetResult): WidgetPoint[] {
  if (result.type !== "question") return [];
  switch (result.dataset) {
    case "series":
      return result.rows.map((row) => ({
        key: row.key,
        label: seriesLabel(row.key),
        value: row.value,
        prev: row.prev,
        text: pointText(result.measure, row.value),
        prevText: row.prev === null ? null : pointText(result.measure, row.prev),
      }));
    case "buckets":
      return result.rows.map((row) => ({
        key: row.key,
        label: bucketLabel(result, row),
        value: row.value ?? 0,
        prev: row.prev,
        text: pointText(result.measure, row.value ?? 0),
        prevText: row.prev === null ? null : pointText(result.measure, row.prev),
      }));
    default:
      return [];
  }
}

export function widgetCellsOf(result: WidgetResult): number[][] {
  if (result.type !== "question" || result.dataset !== "matrix") return [];
  const cells = Array.from({ length: MATRIX_WEEKDAYS }, () => Array.from({ length: MATRIX_HOURS }, () => 0));
  for (const row of result.rows) {
    const day = cells[row.weekday];
    if (day && row.hour >= 0 && row.hour < MATRIX_HOURS) day[row.hour] = row.value;
  }
  return cells;
}

export function widgetViewOf(result: WidgetResult | undefined, bind: Bind): WidgetView {
  if (!result) return { shape: null, items: [], stats: [], points: [], cells: [], pages: [], covers: [] };
  return {
    shape: result.shape,
    items: widgetItemsOf(result, bind),
    stats: widgetStatsOf(result),
    points: widgetPointsOf(result),
    cells: widgetCellsOf(result),
    pages: storyPagesOf(result),
    covers: storyCoversOf(result),
  };
}

export function viewIsEmpty(view: WidgetView): boolean {
  return (
    view.items.length === 0 &&
    view.pages.length === 0 &&
    !view.points.some((point) => point.value > 0) &&
    !view.cells.some((row) => row.some((value) => value > 0))
  );
}

export function acceptedBlocks(
  contracts: readonly BlockContractView[],
  { shape, compare }: BlockSuggestionInput
): WidgetBlock[] {
  return contracts
    .filter((contract) => contract.shapes.includes(shape) && (!contract.needsCompare || compare))
    .map((contract) => contract.key);
}

export function suggestBlocks(contracts: readonly BlockContractView[], input: BlockSuggestionInput): WidgetBlock[] {
  const order = SUGGESTED_BLOCKS[input.shape];
  const rankOf = (block: WidgetBlock) => {
    const index = order.indexOf(block);
    return index === -1 ? order.length : index;
  };
  return acceptedBlocks(contracts, input)
    .filter((block) => block !== "yearCalendar" || input.dailyYear)
    .sort((left, right) => rankOf(left) - rankOf(right));
}

export function moveText(move: WidgetMove): string {
  switch (move.kind) {
    case "new":
      return i18n.t("discover:customWidget.value.new");
    case "rank":
      return rankDeltaText(move.by);
    case "value":
      return new Intl.NumberFormat(i18n.language, { signDisplay: "exceptZero" }).format(move.by);
  }
}

export function moveDirection(move: WidgetMove): MoveDirection {
  if (move.kind === "new") return "new";
  if (move.by === 0) return "same";
  return move.by > 0 ? "up" : "down";
}

export function deltaText(delta: number | null): string | null {
  if (delta === null || delta === 0) return null;
  const formatted = compactCount(Math.abs(delta));
  return delta > 0
    ? i18n.t("discover:customWidget.delta.up", { value: formatted })
    : i18n.t("discover:customWidget.delta.down", { value: formatted });
}

export function itemControls(item: WidgetItem, action: WidgetAction, handlers: WidgetHandlers): WidgetItemControls {
  if (action === "none") return {};
  const { open, play, request, link } = item;
  if (action === "openUrl") return link ? { onSelect: () => handlers.openUrl(link) } : {};
  const onSelect = open ? () => handlers.open(open) : undefined;
  if (action === "play" && play) {
    return {
      onSelect,
      coverAction: {
        kind: "play",
        label: i18n.t("discover:history.play", { name: item.title }),
        onClick: () => handlers.play(play),
      },
    };
  }
  if (action === "request" && request) {
    return {
      onSelect,
      coverAction: {
        kind: "request",
        label: i18n.t("discover:requestNamed", { name: item.title }),
        onClick: () => handlers.request(request),
      },
    };
  }
  return { onSelect };
}

export function customWidgetNote({ result, isError, empty }: CustomWidgetNoteInput): string | null {
  if (isError) return i18n.t("discover:board.loadError");
  if (result?.type === "feed" && result.needs !== null) {
    return i18n.t(`discover:customWidget.needs.${result.needs}`);
  }
  if (result?.type === "feed" && result.dataset === "items" && result.failure !== null) {
    return i18n.t(`discover:customWidget.news.${result.failure}`);
  }
  if (result?.type === "feed" && result.dataset === "events" && result.failure !== null) {
    return i18n.t(`discover:customWidget.events.${result.failure}`);
  }
  const story = storyNoteOf(result);
  if (story) return story;
  if (result?.type === "question" && result.privacy !== null) {
    return result.privacy.reason === "notShared"
      ? i18n.t("discover:customWidget.privacy.notShared", {
          name: result.privacy.name ?? i18n.t("widgets:rules.people.someone"),
        })
      : i18n.t("discover:customWidget.privacy.nobodyShares");
  }
  return empty ? i18n.t("discover:customWidget.empty") : null;
}
