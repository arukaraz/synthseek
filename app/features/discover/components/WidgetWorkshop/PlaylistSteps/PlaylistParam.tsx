"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SearchCombobox } from "@components/ui/SearchCombobox";
import { useLibraryPlaylists } from "@hooks/api/queries/library/useLibraryPlaylists";
import { useDebounce } from "@hooks/ui/useDebounce";

import { SEARCH_DEBOUNCE_MS, SEARCH_MENU_LIMIT } from "../constants";
import { nameValue } from "../styles";
import type { PlaylistParamProps } from "./types";

export function PlaylistParam({ label, slot, onChange }: PlaylistParamProps) {
  const { t } = useTranslation("widgets");
  const [query, setQuery] = useState("");
  const typed = useDebounce(query.trim(), { delay: SEARCH_DEBOUNCE_MS });
  const playlists = useLibraryPlaylists({ q: typed.length > 0 ? typed : undefined }, true);
  const options = useMemo(
    () =>
      (playlists.items ?? [])
        .slice(0, SEARCH_MENU_LIMIT)
        .map((playlist) => ({ value: playlist.id, label: playlist.name })),
    [playlists.items]
  );

  return (
    <span className={nameValue({ full: true })}>
      <SearchCombobox
        label={label}
        placeholder={t("set.playlistSearch")}
        selected={slot.param === null ? undefined : slot.label}
        options={options}
        query={query}
        onQueryChange={setQuery}
        onPick={(option) => onChange(option.value, option.label)}
        emptyText={t("rules.noMatch")}
      />
    </span>
  );
}
