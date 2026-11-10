"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot } from "../../styles";
import { AccountPlaybackCard } from "./AccountPlaybackCard";
import { BrowserPlaybackCard } from "./BrowserPlaybackCard";

export function PlaybackSection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.playback;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <AccountPlaybackCard />
      <BrowserPlaybackCard />
    </div>
  );
}
