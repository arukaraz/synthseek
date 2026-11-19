import type { FollowedArtist, FollowRelease } from "@hooks/api/queries/artist-follow/types";
import i18n from "@locale";

import type { ReleaseAlbumRef, ReleaseArtistRef } from "@components/ReleaseActions";

import {
  CIVIL_DATE_LENGTH,
  GRID_KEYS,
  MONDAY,
  MONTHS_PER_YEAR,
  PAGE_MONTHS,
  SUNDAY,
  SUNDAY_FIRST_LANGUAGES,
  TYPE_ORDER,
  WEEK_INFO_SCHEMA,
  WEEK_LENGTH,
} from "./constants";
import type { DayGroup, GridDay, GridKey, MonthGridInput, MonthRef } from "./types";

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

function isoOf(year: number, month: number, day: number): string {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

function partsOf(iso: string): { year: number; month: number; day: number } {
  const [year = 0, month = 1, day = 1] = iso.slice(0, CIVIL_DATE_LENGTH).split("-").map(Number);
  return { year, month, day };
}

function utcDateOf(iso: string): Date {
  const { year, month, day } = partsOf(iso);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(iso: string, delta: number): string {
  const date = utcDateOf(iso);
  date.setUTCDate(date.getUTCDate() + delta);
  return isoOf(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function weekdayOf(iso: string): number {
  return utcDateOf(iso).getUTCDay();
}

function daysInMonth({ year, month }: MonthRef): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthOf(iso: string): MonthRef {
  const { year, month } = partsOf(iso);
  return { year, month };
}

export function monthKey({ year, month }: MonthRef): string {
  return `${pad(year, 4)}-${pad(month)}`;
}

export function parseMonthParam(raw: string | null | undefined): MonthRef | null {
  if (!raw) return null;
  const [year, month, extra] = raw.split("-").map(Number);
  if (extra !== undefined || year === undefined || month === undefined) return null;
  const valid =
    Number.isInteger(year) && Number.isInteger(month) && year >= 1 && month >= 1 && month <= MONTHS_PER_YEAR;
  return valid ? { year, month } : null;
}

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const index = year * MONTHS_PER_YEAR + (month - 1) + delta;
  return { year: Math.floor(index / MONTHS_PER_YEAR), month: (index % MONTHS_PER_YEAR) + 1 };
}

export function monthBounds(ref: MonthRef): { from: string; to: string } {
  return { from: isoOf(ref.year, ref.month, 1), to: isoOf(ref.year, ref.month, daysInMonth(ref)) };
}

export function sameMonth(left: MonthRef, right: MonthRef): boolean {
  return left.year === right.year && left.month === right.month;
}

export function firstWeekday(language: string): number {
  const locale = new Intl.Locale(language);
  const getter: unknown = Reflect.get(locale, "getWeekInfo");
  const info: unknown =
    typeof getter === "function" ? Reflect.apply(getter, locale, []) : Reflect.get(locale, "weekInfo");
  const parsed = WEEK_INFO_SCHEMA.safeParse(info);
  if (parsed.success) return parsed.data.firstDay;
  return SUNDAY_FIRST_LANGUAGES.includes(locale.language) ? SUNDAY : MONDAY;
}

export function releaseDayOf(release: FollowRelease): string {
  return release.releaseDate.slice(0, CIVIL_DATE_LENGTH);
}

function compareReleases(left: FollowRelease, right: FollowRelease): number {
  return (
    TYPE_ORDER[left.type] - TYPE_ORDER[right.type] ||
    left.artistName.localeCompare(right.artistName) ||
    left.title.localeCompare(right.title)
  );
}

export function buildMonthGrid({ ref, firstDay, releases, today }: MonthGridInput): GridDay[][] {
  const first = isoOf(ref.year, ref.month, 1);
  const offset = (weekdayOf(first) - (firstDay % WEEK_LENGTH) + WEEK_LENGTH) % WEEK_LENGTH;
  const weeks = Math.ceil((offset + daysInMonth(ref)) / WEEK_LENGTH);
  const byDay = new Map<string, FollowRelease[]>();
  for (const release of releases) {
    const key = releaseDayOf(release);
    byDay.set(key, [...(byDay.get(key) ?? []), release]);
  }
  const start = addDays(first, -offset);
  return Array.from({ length: weeks }, (_week, weekIndex) =>
    Array.from({ length: WEEK_LENGTH }, (_day, dayIndex) => {
      const iso = addDays(start, weekIndex * WEEK_LENGTH + dayIndex);
      const inMonth = sameMonth(monthOf(iso), ref);
      return {
        iso,
        day: partsOf(iso).day,
        inMonth,
        isToday: iso === today,
        releases: inMonth ? [...(byDay.get(iso) ?? [])].sort(compareReleases) : [],
      };
    })
  );
}

export function groupByDay(releases: readonly FollowRelease[]): DayGroup[] {
  const byDay = new Map<string, FollowRelease[]>();
  for (const release of releases) {
    const key = releaseDayOf(release);
    byDay.set(key, [...(byDay.get(key) ?? []), release]);
  }
  return [...byDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([iso, items]) => ({ iso, releases: [...items].sort(compareReleases) }));
}

export function selectedDayOf(grid: readonly (readonly GridDay[])[], today: string | null): string | null {
  const days = grid.flat().filter((day) => day.inMonth);
  const current = days.find((day) => day.iso === today);
  return current?.iso ?? days.find((day) => day.releases.length > 0)?.iso ?? days[0]?.iso ?? null;
}

export function moveGridFocus(iso: string, key: GridKey, firstDay: number): string {
  switch (key) {
    case "ArrowLeft":
      return addDays(iso, -1);
    case "ArrowRight":
      return addDays(iso, 1);
    case "ArrowUp":
      return addDays(iso, -WEEK_LENGTH);
    case "ArrowDown":
      return addDays(iso, WEEK_LENGTH);
    case "Home":
      return addDays(iso, -((weekdayOf(iso) - (firstDay % WEEK_LENGTH) + WEEK_LENGTH) % WEEK_LENGTH));
    case "End":
      return addDays(iso, WEEK_LENGTH - 1 - ((weekdayOf(iso) - (firstDay % WEEK_LENGTH) + WEEK_LENGTH) % WEEK_LENGTH));
    case "PageUp":
    case "PageDown": {
      const { year, month, day } = partsOf(iso);
      const target = shiftMonth({ year, month }, key === "PageUp" ? -PAGE_MONTHS : PAGE_MONTHS);
      return isoOf(target.year, target.month, Math.min(day, daysInMonth(target)));
    }
  }
}

function formatUtc(iso: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(i18n.language, { ...options, timeZone: "UTC" }).format(utcDateOf(iso));
}

export function monthLabel(ref: MonthRef): string {
  return formatUtc(isoOf(ref.year, ref.month, 1), { month: "long", year: "numeric" });
}

export function weekdayLabel(iso: string, width: "short" | "long"): string {
  return formatUtc(iso, { weekday: width });
}

export function fullDateLabel(iso: string): string {
  return formatUtc(iso, { weekday: "long", month: "long", day: "numeric" });
}

export function releaseDateLabel(iso: string): string {
  return formatUtc(iso, { month: "short", day: "numeric", year: "numeric" });
}

export function dayHeading(iso: string, today: string | null): string {
  if (today !== null) {
    if (iso === today) return i18n.t("follows:releases.today");
    if (iso === addDays(today, 1)) return i18n.t("follows:releases.tomorrow");
    if (iso === addDays(today, -1)) return i18n.t("follows:releases.yesterday");
  }
  return formatUtc(iso, { weekday: "short", month: "short", day: "numeric" });
}

export function currentMonthOf(clock: Date): MonthRef {
  return { year: clock.getFullYear(), month: clock.getMonth() + 1 };
}

export function isCalendarView(raw: string): raw is "month" | "list" {
  return raw === "month" || raw === "list";
}

export function latestLine(item: FollowedArtist): string {
  if (item.unresolvable) return i18n.t("follows:following.unresolvable");
  if (!item.checked || item.latest === null) return i18n.t("follows:following.notChecked");
  const date = releaseDateLabel(item.latest.releaseDate.slice(0, CIVIL_DATE_LENGTH));
  return item.latest.phase === "announced" ? i18n.t("follows:following.announced", { date }) : date;
}

export function gridKeyOf(key: string): GridKey | null {
  return GRID_KEYS.find((candidate) => candidate === key) ?? null;
}

export function albumRefOf(release: FollowRelease): ReleaseAlbumRef {
  return {
    catalogAlbumId: release.catalogAlbumId,
    title: release.title,
    artistName: release.artistName,
    cover: release.image,
  };
}

export function artistRefOf(release: FollowRelease): ReleaseArtistRef {
  return {
    catalogArtistId: release.catalogArtistId,
    name: release.artistName,
    cover: null,
    autoRequest: release.autoRequest,
  };
}
