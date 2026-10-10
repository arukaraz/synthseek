"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { SectionLoading } from "@components/ui/SectionLoading";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { useNotificationCatalog, useNotificationDestinations } from "@hooks/api";

import { SettingsCard } from "../../../components/SettingsCard";
import { CHANNEL_TABS_LAYOUT_ID } from "../constants";
import type { NotificationChannel } from "../types";
import { ChannelPanel } from "./ChannelPanel";

export function NotificationDestinations() {
  const { t } = useTranslation("settings");
  const catalog = useNotificationCatalog();
  const destinations = useNotificationDestinations();
  const [chosen, setChosen] = useState<NotificationChannel | null>(null);

  if (catalog.isError || destinations.isError) {
    return (
      <SettingsCard title={t("notifications.destinations.title")}>
        <p className="text-fg/60 text-sm">{t("notifications.destinations.unavailable")}</p>
      </SettingsCard>
    );
  }
  if (!catalog.data || !destinations.data) return <SectionLoading />;

  const channels = catalog.data.channels;
  const active = chosen !== null && channels.includes(chosen) ? chosen : channels[0];

  return (
    <SettingsCard
      title={t("notifications.destinations.title")}
      description={t("notifications.destinations.description")}
    >
      <SegmentTabs
        items={channels.map((channel) => ({ value: channel, label: t(`notifications.channels.${channel}`) }))}
        value={active}
        onValueChange={setChosen}
        layoutId={CHANNEL_TABS_LAYOUT_ID}
        ariaLabel={t("notifications.destinations.tabsLabel")}
      />
      <ChannelPanel
        key={active}
        channel={active}
        destination={destinations.data.find((destination) => destination.channel === active)}
        catalog={catalog.data}
      />
    </SettingsCard>
  );
}
