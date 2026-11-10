"use client";

import { Trans, useTranslation } from "react-i18next";

import { HashLink, inlineLink } from "@components/HashLink";
import { AutoplaySection, LoudnessSection } from "@components/Player";
import { usePlayerSettings } from "@hooks/ui/player";

import { SettingsCard } from "../../components/SettingsCard";
import { fieldHelper } from "../../styles";

export function AccountPlaybackCard() {
  const { t } = useTranslation("settings");
  const { view, actions } = usePlayerSettings();

  return (
    <SettingsCard
      title={t("playback.account.title")}
      description={t("playback.account.description")}
      anchor="playback.account"
    >
      <LoudnessSection view={view} actions={actions} />
      <AutoplaySection view={view} actions={actions} />
      <span className={fieldHelper()}>
        <Trans
          t={t}
          i18nKey="playback.account.household"
          components={{ household: <HashLink href="/settings/account#household" className={inlineLink()} /> }}
        />
      </span>
    </SettingsCard>
  );
}
