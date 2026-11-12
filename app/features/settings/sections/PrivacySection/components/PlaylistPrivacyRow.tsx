"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { usePrivacyOverview } from "@hooks/api";
import { useUpdateProfile } from "@hooks/api/mutations/auth/useUpdateProfile";

import { EngineRow } from "../../../components/EngineRow";
import { VisibilityChoice } from "../../../components/VisibilityChoice";
import type { PrivacyCardProps } from "../types";

export function PlaylistPrivacyRow({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateProfile();
  const overview = usePrivacyOverview();
  const value = user.playlistVisibility ?? overview.data?.server.defaultPlaylistVisibility;

  return (
    <EngineRow
      label={t("privacy.playlists.label")}
      anchor="privacy.playlists"
      labelTrailing={<InfoTooltip description={t("privacy.playlists.description")} />}
      control={
        value === undefined ? null : (
          <VisibilityChoice
            value={value}
            disabled={update.isPending}
            ariaLabel={t("privacy.playlists.label")}
            onChange={(playlistVisibility) => update.mutate({ playlistVisibility })}
          />
        )
      }
    />
  );
}
