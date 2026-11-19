"use client";

import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@components/ImageWithFallback";
import { ReleaseMainAction, ReleaseMoreMenu } from "@components/ReleaseActions";
import { ReleaseState } from "@components/ReleaseState";

import { MEDIUM_LIST_MIN_WIDTH, WIDE_LIST_MIN_WIDTH } from "../constants";
import { albumRefOf, artistRefOf, dayHeading, monthLabel } from "../helpers";
import {
  listActions,
  listColumn,
  listDayHeader,
  listRoot,
  listRow,
  releaseCopy,
  releaseCover,
  releaseMeta,
  releaseTitle,
} from "../styles";
import type { ReleaseAgendaProps } from "./types";

export function ReleaseAgenda({ groups, today, month, width }: ReleaseAgendaProps) {
  const { t } = useTranslation("follows");
  const showState = width >= MEDIUM_LIST_MIN_WIDTH;
  const showType = width >= WIDE_LIST_MIN_WIDTH;
  const layout = showType ? "wide" : showState ? "medium" : "narrow";

  return (
    <div role="list" aria-label={t("releases.listLabel", { month: monthLabel(month) })} className={listRoot()}>
      {groups.map((group) => (
        <section key={group.iso} aria-label={dayHeading(group.iso, today)}>
          <h3 className={listDayHeader()}>{dayHeading(group.iso, today)}</h3>
          {group.releases.map((release) => (
            <div key={release.releaseId} role="listitem" className={listRow()}>
              <span className={releaseCover()}>
                <ImageWithFallback src={release.image} alt="" fill sizes="48px" />
              </span>
              <span className={releaseCopy()}>
                <span className={releaseTitle()}>{release.title}</span>
                <span className={releaseMeta()}>{t("releases.by", { artist: release.artistName })}</span>
              </span>
              {showType ? <span className={listColumn({ width: "md" })}>{t(`types.${release.type}`)}</span> : null}
              {showState ? (
                <span className={listColumn({ width: "lg" })}>
                  <ReleaseState state={release.state} autoRequest={release.autoRequest} />
                </span>
              ) : (
                <ReleaseState state={release.state} autoRequest={release.autoRequest} showLabel={false} />
              )}
              <span className={listActions({ layout })}>
                <ReleaseMainAction
                  album={albumRefOf(release)}
                  state={release.state}
                  autoRequest={release.autoRequest}
                  compact={!showType}
                />
                <ReleaseMoreMenu
                  artist={artistRefOf(release)}
                  album={albumRefOf(release)}
                  label={t("action.moreFor", { name: release.title })}
                />
              </span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
