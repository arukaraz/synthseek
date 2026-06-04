"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { SaveBar } from "@features/settings/components/SaveBar";
import { SettingsField } from "@features/settings/components/SettingsField";
import { SettingsTextInput } from "@features/settings/components/SettingsTextInput";
import { useUpdateListenBrainz } from "@hooks/api/mutations/discovery/useUpdateListenBrainz";

import { LB_PLAYLIST_KIND_LABEL_KEYS, LB_PLAYLIST_KINDS } from "../constants";
import {
  autoRequestHelper,
  autoRequestLabel,
  autoRequestRow,
  autoRequestText,
  disabledOverlay,
  playlistChip,
  playlistChipsGrid,
  subSection,
  subSectionHeader,
  subSectionSaveBar,
  subSectionTitle,
} from "../styles";
import type { LbPlaylistKind, ListenBrainzCardProps } from "../types";

export function ListenBrainzCard({ config }: ListenBrainzCardProps) {
  const { t } = useTranslation("library");
  const update = useUpdateListenBrainz();
  const [enabled, setEnabled] = useState(config.enabled);
  const [username, setUsername] = useState(config.username ?? "");
  const [kinds, setKinds] = useState<LbPlaylistKind[]>(config.selectedKinds);
  const [autoRequest, setAutoRequest] = useState(config.autoRequest ?? false);

  const isDirty =
    enabled !== config.enabled ||
    username !== (config.username ?? "") ||
    autoRequest !== (config.autoRequest ?? false) ||
    kinds.length !== config.selectedKinds.length ||
    kinds.some((k, i) => k !== config.selectedKinds[i]);

  const toggleKind = (kind: LbPlaylistKind) => {
    setKinds((prev) => (prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]));
  };

  const handleSave = () => {
    update.mutate({
      enabled,
      username: username.trim() || null,
      selectedKinds: kinds,
      autoRequest,
    });
  };

  const handleCancel = () => {
    setEnabled(config.enabled);
    setUsername(config.username ?? "");
    setKinds(config.selectedKinds);
    setAutoRequest(config.autoRequest ?? false);
  };

  return (
    <section className={subSection()} data-anchor-target="listenbrainz">
      <header className={subSectionHeader()}>
        <h3 className={subSectionTitle()}>
          <span className="inline-flex items-center gap-1.5">
            ListenBrainz
            <InfoTooltip description={t("discoveryIntegrations.listenbrainz.tooltip")} />
          </span>
        </h3>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label={t("discoveryIntegrations.listenbrainz.enableAria")}
        />
      </header>

      <div className={disabledOverlay({ disabled: !enabled })}>
        <SettingsField
          label={t("discoveryIntegrations.listenbrainz.usernameLabel")}
          helper={t("discoveryIntegrations.listenbrainz.usernameHelper")}
        >
          <SettingsTextInput
            value={username}
            onChange={setUsername}
            placeholder={t("discoveryIntegrations.listenbrainz.usernamePlaceholder")}
          />
        </SettingsField>

        <SettingsField
          label={t("discoveryIntegrations.listenbrainz.playlistsLabel")}
          helper={t("discoveryIntegrations.listenbrainz.playlistsHelper", { count: kinds.length })}
        >
          <div className={playlistChipsGrid()}>
            {LB_PLAYLIST_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                className={playlistChip({ selected: kinds.includes(kind) })}
                onClick={() => toggleKind(kind)}
                title={t(LB_PLAYLIST_KIND_LABEL_KEYS[kind].description)}
              >
                {t(LB_PLAYLIST_KIND_LABEL_KEYS[kind].label)}
              </button>
            ))}
          </div>
        </SettingsField>

        <div className={autoRequestRow()}>
          <div className={autoRequestText()}>
            <span className={autoRequestLabel()}>{t("discoveryIntegrations.listenbrainz.autoRequestLabel")}</span>
            <span className={autoRequestHelper()}>{t("discoveryIntegrations.listenbrainz.autoRequestHelper")}</span>
          </div>
          <Switch
            checked={autoRequest}
            onCheckedChange={setAutoRequest}
            aria-label={t("discoveryIntegrations.listenbrainz.autoRequestAria")}
          />
        </div>
      </div>

      <div className={subSectionSaveBar()}>
        <SaveBar isDirty={isDirty} isSaving={update.isPending} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </section>
  );
}
