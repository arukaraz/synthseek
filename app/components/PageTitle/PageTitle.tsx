"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

import { APP_TITLE } from "@components/Player/constants";
import { announce, readAnnouncement, subscribeAnnouncement } from "@utils/announcer";
import { readNowPlayingTitle, subscribeNowPlayingTitle } from "@utils/nowPlayingTitle";

import { pageTitleRouteFor } from "./helpers";

export function PageTitle() {
  const { t } = useTranslation(["components", "settings"]);
  const pathname = usePathname();
  const nowPlaying = useSyncExternalStore(subscribeNowPlayingTitle, readNowPlayingTitle, () => null);
  const announcement = useSyncExternalStore(subscribeAnnouncement, readAnnouncement, readAnnouncement);
  const announcedPath = useRef(pathname);

  const route = pageTitleRouteFor(pathname);
  const pageName =
    route === null
      ? null
      : route.parentKey === undefined
        ? t(route.key)
        : t("components:pageTitle.nested", { page: t(route.key), parent: t(route.parentKey) });
  const pageTitle =
    pageName === null ? APP_TITLE : t("components:pageTitle.format", { page: pageName, app: APP_TITLE });
  const title = nowPlaying ?? pageTitle;
  const playing = nowPlaying !== null;

  useEffect(() => {
    if (announcedPath.current === pathname) return;
    announcedPath.current = pathname;
    announce(playing && pageName !== null ? pageName : "");
  }, [pathname, playing, pageName]);

  return (
    <>
      <title>{title}</title>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement.text === "" ? null : <span key={announcement.id}>{announcement.text}</span>}
      </div>
    </>
  );
}
