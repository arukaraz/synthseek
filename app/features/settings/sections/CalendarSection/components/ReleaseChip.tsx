"use client";

import { useTranslation } from "react-i18next";

import { releaseStateInfo } from "@components/ReleaseState";

import { chip, chipAccent, chipGlyph, chipText } from "../styles";
import type { ReleaseChipProps } from "./types";

export function ReleaseChip({ release, iso, onOpen }: ReleaseChipProps) {
  const { t } = useTranslation("follows");
  const info = releaseStateInfo(release.state, release.autoRequest);
  const Glyph = info.glyph;

  return (
    <button
      type="button"
      tabIndex={-1}
      className={chip({ dim: release.type === "single" || release.type === "other" })}
      aria-label={t("releases.chip", {
        artist: release.artistName,
        title: release.title,
        type: t(`types.${release.type}`),
        state: t(info.labelKey),
      })}
      onClick={() => onOpen(iso, release.releaseId)}
    >
      <span className={chipAccent()} aria-hidden />
      <span className={chipText()}>
        {release.artistName}: {release.title}
      </span>
      <span className={chipGlyph()} aria-hidden>
        <Glyph />
      </span>
    </button>
  );
}
