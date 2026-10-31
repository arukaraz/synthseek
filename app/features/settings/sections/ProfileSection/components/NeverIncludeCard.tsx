"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSaveVeto } from "@hooks/api/mutations/widgets/useVetoActions";
import { useLibraryArtists } from "@hooks/api/queries/library/useLibraryArtists";
import { useLibraryTracks } from "@hooks/api/queries/library/useLibraryTracks";
import { useSetGenres } from "@hooks/api/queries/widgets/useSetGenres";
import type { SetVeto } from "@hooks/api/queries/widgets/types";
import { useVeto, useVetoTracks } from "@hooks/api/queries/widgets/useVeto";
import { useDebounce } from "@hooks/ui/useDebounce";
import { matchesTerms, searchTerms } from "@utils/search";

import { SettingsCard } from "../../../components/SettingsCard";
import { EMPTY_VETO, VETO_MENU_LIMIT, VETO_SEARCH_DEBOUNCE_MS } from "../constants";
import { VetoList } from "./VetoList";

export function NeverIncludeCard() {
  const { t } = useTranslation("settings");
  const { data } = useVeto();
  const { data: tracks } = useVetoTracks();
  const save = useSaveVeto();
  const veto = data ?? EMPTY_VETO;
  const [artistQuery, setArtistQuery] = useState("");
  const [trackQuery, setTrackQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const artistTerm = useDebounce(artistQuery.trim(), { delay: VETO_SEARCH_DEBOUNCE_MS });
  const trackTerm = useDebounce(trackQuery.trim(), { delay: VETO_SEARCH_DEBOUNCE_MS });
  const artists = useLibraryArtists({ q: artistTerm.length > 0 ? artistTerm : undefined }, artistTerm.length > 0);
  const trackResults = useLibraryTracks({ q: trackTerm, limit: VETO_MENU_LIMIT }, trackTerm.length > 0);
  const genres = useSetGenres();

  const artistOptions = useMemo(
    () =>
      (artists.items ?? [])
        .filter((entry) => !veto.artists.includes(entry.artist))
        .slice(0, VETO_MENU_LIMIT)
        .map((entry) => ({ value: entry.artist, label: entry.artist })),
    [artists.items, veto.artists]
  );
  const trackOptions = useMemo(
    () =>
      (trackResults.data?.items ?? [])
        .filter((track) => !veto.tracks.includes(track.id))
        .map((track) => ({ value: track.id, label: track.title, hint: track.artist })),
    [trackResults.data?.items, veto.tracks]
  );
  const genreOptions = useMemo(() => {
    const terms = searchTerms(genreQuery);
    return (genres.data ?? [])
      .filter((genre) => !veto.noTaste.includes(genre) && (terms.length === 0 || matchesTerms(terms, [genre])))
      .slice(0, VETO_MENU_LIMIT)
      .map((genre) => ({ value: genre, label: genre }));
  }, [genreQuery, genres.data, veto.noTaste]);

  const add = (key: keyof SetVeto, value: string) => save.mutate({ ...veto, [key]: [...veto[key], value] });
  const remove = (key: keyof SetVeto, value: string) =>
    save.mutate({ ...veto, [key]: veto[key].filter((entry) => entry !== value) });
  const trackEntries = veto.tracks.map((id) => {
    const track = tracks?.find((entry) => entry.id === id);
    return { value: id, label: track ? t("neverInclude.trackBy", { title: track.title, artist: track.artist }) : id };
  });

  return (
    <SettingsCard title={t("neverInclude.title")} description={t("neverInclude.description")}>
      <VetoList
        label={t("neverInclude.artists")}
        placeholder={t("neverInclude.searchArtists")}
        entries={veto.artists.map((artist) => ({ value: artist, label: artist }))}
        options={artistOptions}
        query={artistQuery}
        onQueryChange={setArtistQuery}
        onAdd={(value) => add("artists", value)}
        onRemove={(value) => remove("artists", value)}
      />
      <VetoList
        label={t("neverInclude.tracks")}
        placeholder={t("neverInclude.searchTracks")}
        entries={trackEntries}
        options={trackOptions}
        query={trackQuery}
        onQueryChange={setTrackQuery}
        onAdd={(value) => add("tracks", value)}
        onRemove={(value) => remove("tracks", value)}
      />
      <VetoList
        label={t("neverInclude.noTaste")}
        placeholder={t("neverInclude.searchGenres")}
        entries={veto.noTaste.map((genre) => ({ value: genre, label: genre }))}
        options={genreOptions}
        query={genreQuery}
        onQueryChange={setGenreQuery}
        onAdd={(value) => add("noTaste", value)}
        onRemove={(value) => remove("noTaste", value)}
      />
    </SettingsCard>
  );
}
