"use client";

import { Player } from "@components/Player";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { usePlayerDemo } from "./usePlayerDemo";
import {
  previewChip,
  previewHeaderRow,
  previewHeading,
  previewIntro,
  previewMissing,
  previewRow,
  previewRowActions,
  previewRowButton,
  previewRowMeta,
  previewRowTitle,
  previewScreen,
  previewTable,
} from "./styles";

export function PlayerPreviewScreen() {
  const { t } = useTranslation("player");
  const demo = usePlayerDemo();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className={previewScreen()}>
      <h1 className={previewHeading()}>{t("demo.heading")}</h1>
      <p className={previewIntro()}>{t("demo.intro")}</p>

      <div className={previewTable()}>
        <div className={previewHeaderRow()}>
          <span>{t("demo.columnTrack")}</span>
          <span>{t("demo.columnActions")}</span>
        </div>
        {demo.tracks.map((track) => (
          <div key={track.id} className={previewRow({ missing: track.missing })}>
            <button
              type="button"
              className={previewRowButton()}
              onClick={() => demo.playTrack(track.id)}
              disabled={track.missing}
            >
              <span className="flex min-w-0 flex-col">
                <span className={previewRowTitle({ active: track.id === demo.view.track.id })}>{track.title}</span>
                <span className={previewRowMeta()}>
                  {track.artist} · {track.album} · {track.format.toUpperCase()} {track.bitrateKbps}
                </span>
              </span>
            </button>
            <div className={previewRowActions()}>
              {track.missing ? (
                <span className={previewMissing()}>{t("demo.missingFile")}</span>
              ) : (
                <>
                  <button
                    type="button"
                    className={previewChip({ tone: "primary" })}
                    onClick={() => demo.addNext(track.id)}
                  >
                    {t("demo.playNext")}
                  </button>
                  <button type="button" className={previewChip()} onClick={() => demo.addLast(track.id)}>
                    {t("demo.playLast")}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {mounted ? createPortal(<Player view={demo.view} actions={demo.actions} />, document.body) : null}
    </div>
  );
}
