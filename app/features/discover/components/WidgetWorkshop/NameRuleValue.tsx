"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SearchCombobox } from "@components/ui/SearchCombobox";
import { SelectMenu } from "@components/ui/SelectMenu";
import { useLibraryArtists } from "@hooks/api/queries/library/useLibraryArtists";
import { useSetGenres } from "@hooks/api/queries/widgets/useSetGenres";
import { useDebounce } from "@hooks/ui/useDebounce";

import { SEARCH_DEBOUNCE_MS, SEARCH_MENU_LIMIT, UNSET_RULE_VALUE } from "./constants";
import { nameValue } from "./styles";
import type { NameRuleValueProps } from "./types";

export function NameRuleValue({ label, value, kind, display, full = false, extra = [], onChange }: NameRuleValueProps) {
  const { t } = useTranslation("widgets");
  const [query, setQuery] = useState("");
  const typed = useDebounce(query.trim(), { delay: SEARCH_DEBOUNCE_MS });
  const genres = useSetGenres(kind === "genre");
  const artists = useLibraryArtists({ q: typed.length > 0 ? typed : undefined }, kind === "artist");
  const artistOptions = useMemo(() => {
    const names = (artists.items ?? []).map((entry) => entry.artist);
    const shown = typed.length === 0 ? extra : [];
    return [...shown, ...names.slice(0, SEARCH_MENU_LIMIT).map((name) => ({ value: name, label: name }))];
  }, [artists.items, extra, typed]);

  if (kind === "genre") {
    return (
      <span className={nameValue({ full })}>
        <SelectMenu
          ariaLabel={label}
          value={value === UNSET_RULE_VALUE ? undefined : value}
          placeholder={t("rules.searchValue")}
          options={[...extra, ...(genres.data ?? []).map((genre) => ({ value: genre, label: genre }))]}
          onChange={onChange}
        />
      </span>
    );
  }

  return (
    <span className={nameValue({ full })}>
      <SearchCombobox
        label={label}
        placeholder={value === UNSET_RULE_VALUE ? t("rules.searchValue") : (display ?? value)}
        options={artistOptions}
        query={query}
        onQueryChange={setQuery}
        onPick={(option) => onChange(option.value)}
        emptyText={t("rules.noMatch")}
      />
    </span>
  );
}
