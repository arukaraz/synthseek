import { ContentType, type FilterType, type MusicItem } from "@api/__generated__/types";
import { getSecondaryInfo, transformResultForDisplay } from "@features/search/components/Results/helpers";
import i18n from "@locale";

import { OMNI_LIST_ID } from "./constants";
import type { OmniOption, OmniOptionText } from "./types";

export function scopeTypes(scope: FilterType): ContentType[] {
  return scope === "all" ? [...ContentType.options] : [scope];
}

export function resultOption(item: MusicItem): OmniOption {
  const display = transformResultForDisplay(item);
  return {
    kind: "result",
    key: `${item.type}:${item.id}`,
    title: display.name,
    subtitle: getSecondaryInfo(display) || display.artist,
    image: display.image,
    type: item.type,
    item,
  };
}

export function omniOptions(
  query: string,
  recent: readonly string[],
  results: readonly OmniOption[],
  gotos: readonly OmniOption[]
): OmniOption[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...recent.map((entry): OmniOption => ({ kind: "recent", key: `recent:${entry}`, query: entry })), ...gotos];
  }
  return [...results, { kind: "seeAll", key: "see-all", query: trimmed }, ...gotos];
}

export function optionText(option: OmniOption): OmniOptionText {
  switch (option.kind) {
    case "result":
      return { title: option.title, subtitle: option.subtitle };
    case "recent":
      return { title: option.query, subtitle: "" };
    case "seeAll":
      return {
        title: i18n.t("components:header.omni.seeAll", { query: option.query }),
        subtitle: i18n.t("components:header.omni.seeAllHint"),
      };
    case "goto":
      return { title: option.title, subtitle: option.subtitle };
  }
}

export function optionId(index: number): string {
  return `${OMNI_LIST_ID}-${index}`;
}
