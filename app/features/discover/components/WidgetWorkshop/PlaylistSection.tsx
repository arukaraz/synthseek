"use client";

import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { Switch } from "@components/ui/Switch";

import { DEFAULT_SMART_REFRESH, SMART_REFRESHES } from "./constants";
import { fieldLabel, playlistToggle, section, sectionHead, sectionHelp, sectionNumber, sectionTitle } from "./styles";
import type { PlaylistSectionProps } from "./types";

export function PlaylistSection({ workshop, number }: PlaylistSectionProps) {
  const { t } = useTranslation("widgets");
  const { meta, playlist } = workshop.draft;
  const rule = workshop.purpose === "rule";
  const refreshPicker = playlist ? (
    <div className={fieldLabel()}>
      {t("playlist.refresh")}
      <SegmentTabs
        items={SMART_REFRESHES.map((refresh) => ({ value: refresh, label: t(`playlist.refreshes.${refresh}`) }))}
        value={playlist.refresh}
        onValueChange={workshop.setPlaylist}
        layoutId="widget-workshop-refresh"
        ariaLabel={t("playlist.refresh")}
      />
    </div>
  ) : null;

  return (
    <section className={section()} aria-labelledby="workshop-playlist-title">
      <div className={sectionHead()}>
        <span className={sectionNumber()}>{number}</span>
        <h3 id="workshop-playlist-title" className={sectionTitle()}>
          {t("playlist.title")}
        </h3>
      </div>
      <p className={sectionHelp()}>{rule ? t("playlist.ruleHelp") : t("playlist.help")}</p>
      {rule ? (
        <label className={fieldLabel()}>
          {t("details.name")}
          <Input size="sm" value={meta.name} onChange={(event) => workshop.setName(event.target.value)} />
        </label>
      ) : (
        <label className={playlistToggle()}>
          <Switch
            checked={playlist !== null}
            onCheckedChange={(on) => workshop.setPlaylist(on ? DEFAULT_SMART_REFRESH : null)}
          />
          {t("playlist.alsoSave")}
        </label>
      )}
      {refreshPicker}
    </section>
  );
}
