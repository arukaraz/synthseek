"use client";

import { useTranslation } from "react-i18next";

import { ModalChoice } from "@components/ui/ModalActionBar";

import { DEFAULT_SMART_REFRESH } from "./constants";
import { RefreshPicker } from "./RefreshPicker";
import { playlistChoice } from "./styles";
import type { PlaylistChoiceProps } from "./types";

export function PlaylistChoice({ workshop }: PlaylistChoiceProps) {
  const { t } = useTranslation("widgets");
  const { playlist } = workshop.draft;

  return (
    <div className={playlistChoice()}>
      <ModalChoice
        label={t("playlist.alsoSave")}
        hint={t("playlist.help")}
        checked={playlist !== null}
        onChange={(on) => workshop.setPlaylist(on ? DEFAULT_SMART_REFRESH : null)}
      />
      {playlist ? <RefreshPicker value={playlist.refresh} onChange={workshop.setPlaylist} /> : null}
    </div>
  );
}
