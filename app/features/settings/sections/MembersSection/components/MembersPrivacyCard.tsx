"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";
import { usePrivacyOverview, useUpdateServerPrivacy } from "@hooks/api";

import { EngineRow } from "../../../components/EngineRow";
import { SaveBar } from "../../../components/SaveBar";
import { SettingsCard } from "../../../components/SettingsCard";
import { VisibilityChoice } from "../../../components/VisibilityChoice";
import { sameServerPrivacy } from "../helpers";
import type { ServerPrivacy } from "../types";

export function MembersPrivacyCard() {
  const { t } = useTranslation("settings");
  const overview = usePrivacyOverview();
  const update = useUpdateServerPrivacy();
  const [draft, setDraft] = useState<ServerPrivacy | null>(null);

  const saved = overview.data?.server;
  if (saved === undefined) return null;
  const value = draft ?? saved;

  return (
    <SettingsCard title={t("privacy.server.title")} anchor="privacy.server">
      <EngineRow
        label={t("privacy.server.requests.label")}
        description={t("privacy.server.requests.description")}
        anchor="privacy.server.requests"
        control={
          <Switch
            checked={value.membersSeeRequests}
            onCheckedChange={(membersSeeRequests) => setDraft({ ...value, membersSeeRequests })}
            aria-label={t("privacy.server.requests.label")}
          />
        }
      />
      <EngineRow
        label={t("privacy.server.playlists.label")}
        description={t("privacy.server.playlists.description")}
        anchor="privacy.server.playlists"
        control={
          <VisibilityChoice
            value={value.defaultPlaylistVisibility}
            disabled={false}
            ariaLabel={t("privacy.server.playlists.label")}
            onChange={(defaultPlaylistVisibility) => setDraft({ ...value, defaultPlaylistVisibility })}
          />
        }
      />
      <EngineRow
        label={t("privacy.server.nowPlaying.label")}
        description={t("privacy.server.nowPlaying.description")}
        anchor="privacy.server.nowPlaying"
        control={
          <Switch
            checked={value.nowPlayingEnabled}
            onCheckedChange={(nowPlayingEnabled) => setDraft({ ...value, nowPlayingEnabled })}
            aria-label={t("privacy.server.nowPlaying.label")}
          />
        }
      />
      <SaveBar
        isDirty={draft !== null && !sameServerPrivacy(draft, saved)}
        isSaving={update.isPending}
        onSave={async () => {
          await update.mutateAsync(value);
          setDraft(null);
        }}
        onCancel={() => setDraft(null)}
      />
    </SettingsCard>
  );
}
