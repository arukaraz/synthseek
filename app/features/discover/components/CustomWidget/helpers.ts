import type { LucideIcon } from "lucide-react";

import i18n from "@locale";

import {
  albumRequestItem,
  albumTarget,
  artistRequestItem,
  artistTarget,
  trackRequestItem,
} from "@features/content-detail";
import type {
  FeedWidgetResult,
  QuestionWidgetResult,
  WidgetAction,
  WidgetBindSlot,
  WidgetDocument,
  WidgetMeasure,
  WidgetResult,
  WidgetRowOf,
} from "@hooks/api/queries/widgets/types";
import { calendarDateOf, formatCalendarDate, formatRelativeTime, isoDayOf } from "@utils/formatters";

import { compactCount } from "../helpers";
import { FALLBACK_WIDGET_ICON, WIDGET_ICONS } from "./constants";
import type { CustomWidgetNoteInput, WidgetHandlers, WidgetItem, WidgetItemControls, WidgetStat } from "./types";

type Bind = WidgetDocument["view"]["bind"];
type QuestionTrack = WidgetRowOf<QuestionWidgetResult, "tracks">;
type QuestionAlbum = WidgetRowOf<QuestionWidgetResult, "albums">;
type QuestionArtist = WidgetRowOf<QuestionWidgetResult, "artists">;
type QuestionBucket = WidgetRowOf<QuestionWidgetResult, "buckets">;
type FeedTrack = WidgetRowOf<FeedWidgetResult, "tracks">;
type FeedAlbum = WidgetRowOf<FeedWidgetResult, "albums">;
type FeedArtist = WidgetRowOf<FeedWidgetResult, "artists">;

export function widgetIconOf(name: string): LucideIcon {
  return WIDGET_ICONS.get(name) ?? FALLBACK_WIDGET_ICON;
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

function questionTrackItem(row: QuestionTrack, measure: WidgetMeasure, bind: Bind): WidgetItem {
  return {
    key: row.id,
    title: bound(row, bind, "title", row.title) ?? row.title,
    subtitle: bound(row, bind, "subtitle", row.artist) ?? "",
    cover: bound(row, bind, "cover", row.cover),
    value: bound(row, bind, "value", measureText(measure, row.value, whenOf(measure, row))),
    date: dayOf(whenOf(measure, row) ?? row.playedAt),
    play: row.inLibrary ? { kind: "tracks", trackIds: [row.trackId] } : null,
    request: null,
    open: null,
  };
}

function questionAlbumItem(row: QuestionAlbum, measure: WidgetMeasure, bind: Bind): WidgetItem {
  const album = { id: row.albumExternalId, name: row.name, artistName: row.artist, cover: row.cover };
  return {
    key: row.id,
    title: bound(row, bind, "title", row.name) ?? row.name,
    subtitle: bound(row, bind, "subtitle", row.artist) ?? "",
    cover: bound(row, bind, "cover", row.cover),
    value: bound(row, bind, "value", measureText(measure, row.value, whenOf(measure, row))),
    date: row.releaseDate.length > 0 ? row.releaseDate : null,
    play: row.inLibrary ? { kind: "album", albumExternalId: row.albumExternalId } : null,
    request: albumRequestItem(album),
    open: albumTarget(album),
  };
}

function questionArtistItem(row: QuestionArtist, measure: WidgetMeasure, bind: Bind): WidgetItem {
  return {
    key: row.id,
    title: bound(row, bind, "title", row.name) ?? row.name,
    subtitle: bound(row, bind, "subtitle", i18n.t("discover:customWidget.value.tracks", { count: row.tracks })) ?? "",
    cover: bound(row, bind, "cover", row.cover),
    value: bound(row, bind, "value", measureText(measure, row.value, row.playedAt)),
    date: dayOf(row.playedAt),
    play: row.tracks > 0 ? { kind: "artist", artist: row.name } : null,
    request: null,
    open: null,
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
    play: null,
    request: null,
    open: null,
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
    play: row.trackId ? { kind: "tracks", trackIds: [row.trackId] } : null,
    request,
    open: null,
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
    play: row.inLibrary && row.catalogAlbumId ? { kind: "album", albumExternalId: row.catalogAlbumId } : null,
    request: album ? albumRequestItem(album) : null,
    open: album ? albumTarget(album) : null,
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
    play: row.artistId ? { kind: "artist", artist: row.name } : null,
    request: artist ? artistRequestItem(artist) : null,
    open: artist ? artistTarget(artist) : null,
  };
}

function questionItems(result: QuestionWidgetResult, bind: Bind): WidgetItem[] {
  switch (result.dataset) {
    case "tracks":
      return result.rows.map((row) => questionTrackItem(row, result.measure, bind));
    case "albums":
      return result.rows.map((row) => questionAlbumItem(row, result.measure, bind));
    case "artists":
      return result.rows.map((row) => questionArtistItem(row, result.measure, bind));
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
  }
}

export function widgetItemsOf(result: WidgetResult, bind: Bind): WidgetItem[] {
  return result.type === "question" ? questionItems(result, bind) : feedItems(result, bind);
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

export function deltaText(delta: number | null): string | null {
  if (delta === null || delta === 0) return null;
  const formatted = compactCount(Math.abs(delta));
  return delta > 0
    ? i18n.t("discover:customWidget.delta.up", { value: formatted })
    : i18n.t("discover:customWidget.delta.down", { value: formatted });
}

export function itemControls(item: WidgetItem, action: WidgetAction, handlers: WidgetHandlers): WidgetItemControls {
  if (action === "none") return {};
  const { open, play, request } = item;
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

export function customWidgetNote({ result, isError, empty, supported }: CustomWidgetNoteInput): string | null {
  if (!supported) return i18n.t("discover:customWidget.unsupported");
  if (isError) return i18n.t("discover:board.loadError");
  if (result?.type === "feed" && result.needs !== null) {
    return i18n.t(`discover:customWidget.needs.${result.needs}`);
  }
  return empty ? i18n.t("discover:customWidget.empty") : null;
}
