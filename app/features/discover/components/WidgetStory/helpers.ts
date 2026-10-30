import i18n from "@locale";

import type { RecapFact, WidgetResult } from "@hooks/api/queries/widgets/types";
import { calendarDateOf } from "@utils/formatters";

import { compactCount, percentOf } from "../helpers";
import { MINUTES_PER_HOUR } from "./constants";
import type { StoryPage } from "./types";

function plays(count: number): string {
  return i18n.t("discover:customWidget.value.plays", { count });
}

function dayText(date: string): string {
  const parsed = calendarDateOf(date);
  if (!parsed) return date;
  return parsed.toLocaleDateString(i18n.language, { weekday: "long", month: "long", day: "numeric" });
}

function hourText(hour: number): string {
  return new Intl.DateTimeFormat(i18n.language, { hour: "numeric" }).format(new Date(2000, 0, 1, hour));
}

function page(fact: RecapFact): StoryPage {
  const base = {
    key: fact.kind,
    label: i18n.t(`discover:customWidget.story.label.${fact.kind}`),
    detail: null,
    cover: null,
    rows: [],
  };
  switch (fact.kind) {
    case "plays":
      return {
        ...base,
        headline: compactCount(fact.value),
        detail: i18n.t("discover:customWidget.story.detail.plays"),
      };
    case "minutes":
      return {
        ...base,
        headline: compactCount(fact.value),
        detail: i18n.t("discover:customWidget.story.detail.minutes", {
          hours: compactCount(Math.round(fact.value / MINUTES_PER_HOUR)),
        }),
      };
    case "topArtist":
      return { ...base, headline: fact.name, detail: plays(fact.plays), cover: fact.cover };
    case "topTrack":
      return {
        ...base,
        headline: fact.title,
        detail: i18n.t("discover:customWidget.story.detail.byArtist", {
          artist: fact.artist,
          plays: plays(fact.plays),
        }),
        cover: fact.cover,
      };
    case "topAlbums": {
      const [first] = fact.albums;
      return {
        ...base,
        headline: first?.name ?? "",
        cover: first?.cover ?? null,
        rows: fact.albums.map((album, index) => ({
          key: album.id,
          label: i18n.t("discover:customWidget.story.rank", { rank: index + 1, name: album.name }),
          value: plays(album.plays),
        })),
      };
    }
    case "topGenres": {
      const [first] = fact.genres;
      return {
        ...base,
        headline: first?.label ?? "",
        rows: fact.genres.map((genre) => ({ key: genre.label, label: genre.label, value: percentOf(genre.share) })),
      };
    }
    case "newArtists":
      return {
        ...base,
        headline: compactCount(fact.count),
        detail:
          fact.names.length > 0
            ? i18n.t("discover:customWidget.story.detail.newArtists", { names: fact.names.join(", ") })
            : null,
      };
    case "listeningAge":
      return {
        ...base,
        headline: i18n.t("discover:customWidget.story.years", { from: fact.from, to: fact.to }),
        detail: i18n.t("discover:customWidget.story.detail.listeningAge", { share: percentOf(fact.share) }),
      };
    case "busiestDay":
      return { ...base, headline: dayText(fact.date), detail: plays(fact.plays) };
    case "peakHour":
      return { ...base, headline: hourText(fact.hour), detail: plays(fact.plays) };
  }
}

export function storyPagesOf(result: WidgetResult): StoryPage[] {
  return result.type === "recap" ? result.facts.map(page) : [];
}

export function storyCoversOf(result: WidgetResult): string[] {
  return result.type === "recap" ? result.covers : [];
}

export function storyNoteOf(result: WidgetResult | undefined): string | null {
  if (result?.type !== "recap" || result.facts.length > 0) return null;
  return i18n.t("discover:customWidget.story.notEnough", { plays: result.plays, minimum: result.minimumPlays });
}

export function storyIndexOf(index: number, total: number): number {
  if (total === 0) return 0;
  return ((index % total) + total) % total;
}
