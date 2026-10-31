"use client";

import { useTranslation } from "react-i18next";

import { CoverActionButton } from "../CustomWidget/CoverActionButton";
import { CoverArt } from "../WidgetRow/CoverArt";
import { orbitArtist, orbitBecause, orbitCard, orbitCover, orbitOpen, orbitTitle } from "./styles";
import type { OrbitCardProps } from "./types";

export function OrbitCard({ album, onOpen, action }: OrbitCardProps) {
  const { t } = useTranslation("discover");

  return (
    <article className={orbitCard()}>
      <span className={orbitCover()}>
        <CoverArt src={album.cover} seed={album.id} sizes="200px" />
        <CoverActionButton action={action} />
      </span>
      <button type="button" className={orbitOpen()} onClick={onOpen}>
        <span className={orbitTitle()}>{album.name}</span>
      </button>
      <span className={orbitArtist()}>{album.artist}</span>
      <span className={orbitBecause()}>{t("orbit.because", { title: album.because })}</span>
    </article>
  );
}
