"use client";

import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";

import { RefreshPicker } from "./RefreshPicker";
import { fieldLabel, section, sectionHead, sectionHelp, sectionNumber, sectionTitle } from "./styles";
import type { PlaylistSectionProps } from "./types";

export function PlaylistSection({ workshop }: PlaylistSectionProps) {
  const { t } = useTranslation("widgets");
  const { meta, playlist } = workshop.draft;

  return (
    <section className={section()} aria-labelledby="workshop-playlist-title">
      <div className={sectionHead()}>
        <span className={sectionNumber()}>2</span>
        <h3 id="workshop-playlist-title" className={sectionTitle()}>
          {t("playlist.title")}
        </h3>
      </div>
      <p className={sectionHelp()}>{t("playlist.ruleHelp")}</p>
      <label className={fieldLabel()}>
        {t("details.name")}
        <Input size="sm" value={meta.name} onChange={(event) => workshop.setName(event.target.value)} />
      </label>
      {playlist ? (
        <div className={fieldLabel()}>
          {t("playlist.refresh")}
          <RefreshPicker value={playlist.refresh} onChange={workshop.setPlaylist} />
        </div>
      ) : null}
    </section>
  );
}
