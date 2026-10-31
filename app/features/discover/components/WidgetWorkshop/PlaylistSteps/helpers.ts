import i18n from "@locale";

import type { HouseholdMember, PlaylistSetQuery, SetSlot } from "@hooks/api/queries/widgets/types";
import { formatTimeOfDay, formatWeekday, formatWeekdayDateTime } from "@utils/formatters";

import { MOOD_CHOICES } from "../constants";
import { ruleListOf, ruleText } from "../helpers";
import type { RuleChoice } from "../types";
import {
  DEFAULT_WINDOW_DAYS,
  MINUTE_CHARS,
  REPEAT_WINDOW_CUSTOM,
  SCENE_CHOICES,
  SPARE_ORIGINS,
  TOP_PARAM_PREFIX,
  WEEKDAY_REFERENCE_MONDAY,
} from "./constants";
import type { SetMix, SetOrigin, SetOriginGrammar, SetParamKind, SetRefresh } from "./types";

export function paramKindOf(grammar: SetOriginGrammar, origin: SetOrigin): SetParamKind {
  return grammar.origins.find((entry) => entry.key === origin)?.param ?? "none";
}

export function defaultParam(kind: SetParamKind): string | null {
  switch (kind) {
    case "none":
      return null;
    case "genre":
    case "artist":
      return `${TOP_PARAM_PREFIX}1`;
    case "decade":
      return "1990";
    case "mood":
      return "calm";
    case "scene":
      return "focus";
    case "taste":
      return "1";
  }
}

function topRank(param: string): number | null {
  return param.startsWith(TOP_PARAM_PREFIX) ? Number(param.slice(TOP_PARAM_PREFIX.length)) : null;
}

export function paramText(kind: SetParamKind, param: string | null): string {
  if (param === null) return "";
  switch (kind) {
    case "none":
      return "";
    case "genre":
    case "artist": {
      const rank = topRank(param);
      return rank === null ? param : i18n.t(`widgets:set.top.${kind}`, { rank });
    }
    case "decade":
      return i18n.t("discover:customWidget.decade", { year: Number(param) });
    case "mood": {
      const mood = MOOD_CHOICES.find((choice) => choice === param);
      return mood ? i18n.t(`widgets:set.moods.${mood}`) : param;
    }
    case "scene": {
      const scene = SCENE_CHOICES.find((choice) => choice === param);
      return scene ? i18n.t(`widgets:set.scenes.${scene}`) : param;
    }
    case "taste":
      return i18n.t("widgets:set.tasteGroup", { group: param });
  }
}

function slotLabelOf(grammar: SetOriginGrammar, origin: SetOrigin, param: string | null): string {
  const text = paramText(paramKindOf(grammar, origin), param);
  if (text.length === 0) return i18n.t(`widgets:set.origins.${origin}`);
  return origin === "seed" ? i18n.t("widgets:set.soundsLike", { name: text }) : text;
}

export function withSlotLabels(set: PlaylistSetQuery, grammar: SetOriginGrammar | undefined): PlaylistSetQuery {
  if (!grammar) return set;
  return {
    ...set,
    slots: set.slots.map((slot) => ({ ...slot, label: slotLabelOf(grammar, slot.origin, slot.param) })),
  };
}

function nextSlotId(slots: readonly SetSlot[]): string {
  const used = new Set(slots.map((slot) => slot.id));
  let index = slots.length + 1;
  while (used.has(`slot-${index}`)) index += 1;
  return `slot-${index}`;
}

function spareOrigin(slots: readonly SetSlot[]): SetOrigin {
  return SPARE_ORIGINS.find((origin) => !slots.some((slot) => slot.origin === origin)) ?? "favorites";
}

export function withNewSlot(set: PlaylistSetQuery, grammar: SetOriginGrammar): PlaylistSetQuery {
  const origin = spareOrigin(set.slots);
  const param = defaultParam(paramKindOf(grammar, origin));
  const slot = {
    id: nextSlotId(set.slots),
    origin,
    param,
    name: "",
    label: slotLabelOf(grammar, origin, param),
    pinned: false,
  };
  return { ...set, slots: [...set.slots, slot] };
}

export function withSlotCount(set: PlaylistSetQuery, grammar: SetOriginGrammar, count: number): PlaylistSetQuery {
  let next = set;
  while (next.slots.length < count) next = withNewSlot(next, grammar);
  return { ...next, slots: next.slots.slice(0, count) };
}

export function withSlot(set: PlaylistSetQuery, slotId: string, change: (slot: SetSlot) => SetSlot): PlaylistSetQuery {
  return { ...set, slots: set.slots.map((slot) => (slot.id === slotId ? change(slot) : slot)) };
}

export function withOrigin(slot: SetSlot, grammar: SetOriginGrammar, origin: SetOrigin): SetSlot {
  const param = defaultParam(paramKindOf(grammar, origin));
  return { ...slot, origin, param, label: slotLabelOf(grammar, origin, param) };
}

export function withParam(slot: SetSlot, grammar: SetOriginGrammar, param: string): SetSlot {
  return { ...slot, param, label: slotLabelOf(grammar, slot.origin, param) };
}

export function nextRunText(next: Date | string | null): string {
  if (next === null) return i18n.t("widgets:set.onlyWhenAsked");
  return formatWeekdayDateTime(new Date(next));
}

export function windowChoiceOf(window: SetMix["repeatWindow"]): "auto" | "off" | "custom" {
  return typeof window === "number" ? REPEAT_WINDOW_CUSTOM : window;
}

export function windowFrom(choice: "auto" | "off" | "custom"): SetMix["repeatWindow"] {
  return choice === REPEAT_WINDOW_CUSTOM ? DEFAULT_WINDOW_DAYS : choice;
}

export function clockValue(refresh: SetRefresh): string {
  const part = (value: number) => String(value).padStart(MINUTE_CHARS, "0");
  return `${part(refresh.hour)}:${part(refresh.minute)}`;
}

export function clockFrom(value: string): Pick<SetRefresh, "hour" | "minute"> | null {
  const [hour, minute] = value.split(":").map(Number);
  return hour === undefined || minute === undefined || Number.isNaN(hour) || Number.isNaN(minute)
    ? null
    : { hour, minute };
}

export function weekdayName(day: number, width: "short" | "long" = "short"): string {
  const date = new Date(WEEKDAY_REFERENCE_MONDAY);
  date.setDate(date.getDate() + day);
  return formatWeekday(date, width);
}

export function withDayToggled(days: readonly number[], day: number): number[] {
  if (!days.includes(day)) return [...days, day].sort((left, right) => left - right);
  return days.length === 1 ? [...days] : days.filter((entry) => entry !== day);
}

function clockText(refresh: SetRefresh): string {
  const date = new Date(WEEKDAY_REFERENCE_MONDAY);
  date.setHours(refresh.hour, refresh.minute);
  return formatTimeOfDay(date);
}

function cadenceText(refresh: SetRefresh): string {
  const time = clockText(refresh);
  const days = new Intl.ListFormat(i18n.language, { type: "conjunction" }).format(
    refresh.days.map((day) => weekdayName(day, "long"))
  );
  switch (refresh.every) {
    case "daily":
      return i18n.t("widgets:set.cadenceText.daily", { time });
    case "weekly":
      return i18n.t("widgets:set.cadenceText.weekly", { days, time });
    case "biweekly":
      return i18n.t("widgets:set.cadenceText.biweekly", { days, time });
    case "monthly":
      return i18n.t("widgets:set.cadenceText.monthly", { day: refresh.dayOfMonth, time });
    case "manual":
      return i18n.t("widgets:set.cadenceText.manual");
  }
}

export function playlistReadbackOf(
  set: PlaylistSetQuery,
  people: readonly HouseholdMember[],
  playlists: readonly RuleChoice[]
): string {
  const { mode, list } = ruleListOf(set.rules);
  const joiner = i18n.t(mode === "all" ? "widgets:readback.and" : "widgets:readback.or");
  const rules = list.map((rule) => ruleText(rule, people, playlists)).join(joiner);
  return [
    i18n.t("widgets:readback.playlists", {
      count: set.slots.length,
      length: i18n.t(`widgets:readback.length_${set.mix.length.by}`, { value: set.mix.length.value }),
      perArtist: set.mix.perArtist,
      cadence: cadenceText(set.refresh),
    }),
    list.length > 0 ? i18n.t("widgets:readback.where", { rules }) : "",
    i18n.t("widgets:readback.end"),
    " ",
    i18n.t(`widgets:readback.onRefresh_${set.onRefresh.mode}`, { count: set.onRefresh.keep }),
  ].join("");
}
