"use client";

import { useTranslation } from "react-i18next";

import { SETTINGS_PAGE_BY_ID } from "../../../constants";
import { cardDivider, settingsCard } from "../../../styles";
import type { PrivacyCardProps } from "../types";
import { ClearHistoryRow } from "./ClearHistoryRow";
import { HouseholdRow } from "./HouseholdRow";
import { PlayChannelsTable } from "./PlayChannelsTable";
import { PlaylistPrivacyRow } from "./PlaylistPrivacyRow";
import { RequestPrivacyRow } from "./RequestPrivacyRow";
import { SessionLengthRow } from "./SessionLengthRow";

export function PrivacyCard({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");

  return (
    <section className={settingsCard()} aria-label={t(SETTINGS_PAGE_BY_ID.privacy.labelKey)}>
      <PlayChannelsTable user={user} />
      <SessionLengthRow user={user} />
      <div className={cardDivider()} />
      <HouseholdRow user={user} />
      <PlaylistPrivacyRow user={user} />
      <RequestPrivacyRow user={user} />
      <ClearHistoryRow />
    </section>
  );
}
