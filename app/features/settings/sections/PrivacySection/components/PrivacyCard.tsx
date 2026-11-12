"use client";

import { useTranslation } from "react-i18next";

import { SETTINGS_PAGE_BY_ID } from "../../../constants";
import { cardDivider, cardSectionHeader, settingsCard } from "../../../styles";
import type { PrivacyCardProps } from "../types";
import { HouseholdRow } from "./HouseholdRow";
import { ListeningHistoryRows } from "./ListeningHistoryRows";
import { PlaylistPrivacyRow } from "./PlaylistPrivacyRow";
import { RequestPrivacyRow } from "./RequestPrivacyRow";

export function PrivacyCard({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");

  return (
    <section className={settingsCard()} aria-label={t(SETTINGS_PAGE_BY_ID.privacy.labelKey)}>
      <HouseholdRow user={user} />
      <PlaylistPrivacyRow user={user} />
      <RequestPrivacyRow user={user} />
      <div className={cardDivider()} />
      <h2 className={cardSectionHeader()} data-anchor-target="privacy.history">
        {t("privacy.history.title")}
      </h2>
      <ListeningHistoryRows user={user} />
    </section>
  );
}
