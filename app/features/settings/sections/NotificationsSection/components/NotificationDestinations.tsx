"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { SectionLoading } from "@components/ui/SectionLoading";
import { useNotificationCatalog, useNotificationDestinations } from "@hooks/api";

import { SettingsCard } from "../../../components/SettingsCard";
import { emptyPanel } from "../../../styles";
import { draftOf, isDraftComplete } from "../helpers";
import { matrixNote } from "../styles";
import type { DestinationDraft, NotificationChannel } from "../types";
import { DestinationRow } from "./DestinationRow";
import { NotificationMatrix } from "./NotificationMatrix";

export function NotificationDestinations() {
  const { t } = useTranslation("settings");
  const catalog = useNotificationCatalog();
  const destinations = useNotificationDestinations();
  const [edits, setEdits] = useState<Partial<Record<NotificationChannel, DestinationDraft>>>({});
  const [open, setOpen] = useState<NotificationChannel | null>(null);

  if (catalog.isError || destinations.isError) {
    return (
      <SettingsCard title={t("notifications.destinations.title")}>
        <p className="text-fg/60 text-sm">{t("notifications.destinations.unavailable")}</p>
      </SettingsCard>
    );
  }
  if (!catalog.data || !destinations.data) return <SectionLoading />;

  const saved = destinations.data;
  const destinationOf = (channel: NotificationChannel) => saved.find((destination) => destination.channel === channel);
  const baselineOf = (channel: NotificationChannel) => draftOf(channel, destinationOf(channel));
  const draftFor = (channel: NotificationChannel) => edits[channel] ?? baselineOf(channel);
  const setDraft = (channel: NotificationChannel, draft: DestinationDraft) =>
    setEdits((previous) => ({ ...previous, [channel]: draft }));
  const settle = (channel: NotificationChannel) => setEdits((previous) => ({ ...previous, [channel]: undefined }));

  const channels = catalog.data.channels;
  const columns = channels.filter(
    (channel) => (destinationOf(channel)?.configured ?? false) || isDraftComplete(channel, draftFor(channel))
  );

  return (
    <>
      <SettingsCard
        title={t("notifications.destinations.title")}
        description={t("notifications.destinations.description")}
        anchor="destinations"
      >
        {channels.map((channel) => (
          <DestinationRow
            key={channel}
            channel={channel}
            destination={destinationOf(channel)}
            catalog={catalog.data}
            draft={draftFor(channel)}
            baseline={baselineOf(channel)}
            open={open === channel}
            onToggleOpen={() => setOpen(open === channel ? null : channel)}
            onDraftChange={(draft) => setDraft(channel, draft)}
            onSettled={() => settle(channel)}
          />
        ))}
      </SettingsCard>

      <SettingsCard
        title={t("notifications.whatToSend")}
        description={t("notifications.matrix.description")}
        anchor="what-to-send"
      >
        {columns.length === 0 ? (
          <div className={emptyPanel()}>
            <span className="text-fg/60 text-sm">{t("notifications.matrix.empty")}</span>
          </div>
        ) : (
          <>
            <NotificationMatrix
              categories={catalog.data.categories}
              columns={columns}
              kindsOf={(channel) => draftFor(channel).kinds}
              onKindsChange={(channel, kinds) => setDraft(channel, { ...draftFor(channel), kinds })}
            />
            <p className={matrixNote()}>{t("notifications.matrix.note")}</p>
          </>
        )}
      </SettingsCard>
    </>
  );
}
