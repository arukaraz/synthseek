"use client";

import { useTranslation } from "react-i18next";

import { ReleaseMainAction, ReleaseMoreMenu } from "@components/ReleaseActions";
import { ReleaseState } from "@components/ReleaseState";
import { ImageWithFallback } from "@components/ImageWithFallback";

import { albumRefOf, artistRefOf, releaseDateLabel, releaseDayOf } from "../helpers";
import {
  releaseActions,
  releaseCard,
  releaseCardList,
  releaseCopy,
  releaseCover,
  releaseMeta,
  releaseTitle,
} from "../styles";
import type { ReleaseCardsProps } from "./types";

export function ReleaseCards({ releases, today }: ReleaseCardsProps) {
  const { t } = useTranslation("follows");

  return (
    <ul className={releaseCardList()}>
      {releases.map((release) => {
        const day = releaseDayOf(release);
        const out = today !== null && day <= today;
        const date = releaseDateLabel(day);
        return (
          <li key={release.releaseId} className={releaseCard()}>
            <span className={releaseCover()}>
              <ImageWithFallback src={release.image} alt="" fill sizes="48px" />
            </span>
            <span className={releaseCopy()}>
              <span className={releaseTitle()}>{release.title}</span>
              <span className={releaseMeta()}>
                {t("releases.by", { artist: release.artistName })} · {t(`types.${release.type}`)}
                {release.reissue ? ` · ${t("releases.reissue")}` : null}
              </span>
              <span className={releaseMeta()}>
                {out ? t("releases.out", { date }) : t("releases.comesOut", { date })}
              </span>
              <ReleaseState state={release.state} autoRequest={release.autoRequest} />
            </span>
            <span className={releaseActions()}>
              <ReleaseMainAction
                album={albumRefOf(release)}
                state={release.state}
                autoRequest={release.autoRequest}
                compact
              />
              <ReleaseMoreMenu
                artist={artistRefOf(release)}
                album={albumRefOf(release)}
                label={t("action.moreFor", { name: release.title })}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
