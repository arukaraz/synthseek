"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { announce } from "@utils/announcer";

import { TRACK_ANNOUNCE_DELAY_MS } from "./constants";
import { focusedControlNames } from "./helpers";
import type { TrackAnnouncementSubject } from "./types";

export function useTrackAnnouncement({ id, title, artist, playing }: TrackAnnouncementSubject): void {
  const { t } = useTranslation("player");
  const previousIdRef = useRef(id);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const previous = previousIdRef.current;
    previousIdRef.current = id;
    if (id === "" || id === previous) return;
    if (previous === "" && !playingRef.current) return;

    const timer = setTimeout(() => {
      if (focusedControlNames(document.activeElement).some((name) => name.includes(title))) return;
      announce(t("announce.track", { title, artist }));
    }, TRACK_ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [id, title, artist, t]);
}
