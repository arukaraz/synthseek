"use client";

import { useTranslation } from "react-i18next";

import { CoverArt } from "../WidgetRow/CoverArt";
import { orbitArtist, orbitBecause, orbitCard, orbitCover, orbitTitle } from "./styles";
import type { OrbitCardProps } from "./types";

export function OrbitCard({ album, onOpen }: OrbitCardProps) {
  const { t } = useTranslation("discover");

  return (
    <button type="button" className={orbitCard()} onClick={onOpen}>
      <span className={orbitCover()}>
        <CoverArt src={album.cover} seed={album.id} sizes="200px" />
      </span>
      <span className={orbitTitle()}>{album.name}</span>
      <span className={orbitArtist()}>{album.artist}</span>
      <span className={orbitBecause()}>{t("orbit.because", { title: album.because })}</span>
    </button>
  );
}
