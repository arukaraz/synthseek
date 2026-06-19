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
import { playlistNamesDirty, playlistNamesDraft, playlistNamesPatch } from "../helpers";
import {
  autoRequestHelper,
  autoRequestLabel,
  autoRequestRow,
  autoRequestText,
  disabledOverlay,
  playlistChip,
  playlistChipsGrid,
  playlistRenameGroup,
  replacePlaylistRow,
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
  const [replaceExistingPlaylist, setReplaceExistingPlaylist] = useState(config.replaceExistingPlaylist ?? false);
  const [playlistNames, setPlaylistNames] = useState(() => playlistNamesDraft(config.playlistNames));

  const isDirty =
    enabled !== config.enabled ||
    username !== (config.username ?? "") ||
    autoRequest !== (config.autoRequest ?? false) ||
    replaceExistingPlaylist !== (config.replaceExistingPlaylist ?? false) ||
    kinds.length !== config.selectedKinds.length ||
    kinds.some((k, i) => k !== config.selectedKinds[i]) ||
    playlistNamesDirty(playlistNames, config.playlistNames);

  const toggleKind = (kind: LbPlaylistKind) => {
    setKinds((prev) => (prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]));
  };

  const setPlaylistName = (kind: LbPlaylistKind, value: string) => {
    setPlaylistNames((prev) => ({ ...prev, [kind]: value }));
  };

  const handleSave = () => {
    update.mutate({
      enabled,
      username: username.trim() || null,
      selectedKinds: kinds,
      autoRequest,
      replaceExistingPlaylist,
      playlistNames: playlistNamesPatch(playlistNames),
    });
  };

  const handleCancel = () => {
    setEnabled(config.enabled);
    setUsername(config.username ?? "");
    setKinds(config.selectedKinds);
    setAutoRequest(config.autoRequest ?? false);
    setReplaceExistingPlaylist(config.replaceExistingPlaylist ?? false);
    setPlaylistNames(playlistNamesDraft(config.playlistNames));
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

        {kinds.length > 0 ? (
          <SettingsField
            label={t("discoveryIntegrations.listenbrainz.renamePlaylistLabel")}
            helper={t("discoveryIntegrations.listenbrainz.renamePlaylistHelper")}
          >
            <div className={playlistRenameGroup()}>
              {LB_PLAYLIST_KINDS.filter((kind) => kinds.includes(kind)).map((kind) => (
                <SettingsTextInput
                  key={kind}
                  value={playlistNames[kind]}
                  onChange={(value) => setPlaylistName(kind, value)}
                  placeholder={t(LB_PLAYLIST_KIND_LABEL_KEYS[kind].label)}
                  ariaLabel={t(LB_PLAYLIST_KIND_LABEL_KEYS[kind].label)}
                />
              ))}
            </div>
          </SettingsField>
        ) : null}

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

        <div className={replacePlaylistRow({ disabled: !autoRequest })}>
          <div className={autoRequestText()}>
            <span className={autoRequestLabel()}>{t("discoveryIntegrations.listenbrainz.replacePlaylistLabel")}</span>
            <span className={autoRequestHelper()}>{t("discoveryIntegrations.listenbrainz.replacePlaylistHelper")}</span>
          </div>
          <Switch
            checked={replaceExistingPlaylist}
            onCheckedChange={setReplaceExistingPlaylist}
            disabled={!autoRequest}
            aria-label={t("discoveryIntegrations.listenbrainz.replacePlaylistAria")}
          />
        </div>
      </div>

      <div className={subSectionSaveBar()}>
        <SaveBar isDirty={isDirty} isSaving={update.isPending} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </section>
  );
}
