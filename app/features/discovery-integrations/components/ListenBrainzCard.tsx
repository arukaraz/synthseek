"use client";

import { useState } from "react";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { SaveBar } from "@features/settings/components/SaveBar";
import { SettingsField } from "@features/settings/components/SettingsField";
import { SettingsTextInput } from "@features/settings/components/SettingsTextInput";
import { useUpdateListenBrainz } from "@hooks/api/mutations/discovery/useUpdateListenBrainz";

import { LB_PLAYLIST_KIND_OPTIONS } from "../constants";
import {
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
  const update = useUpdateListenBrainz();
  const [enabled, setEnabled] = useState(config.enabled);
  const [username, setUsername] = useState(config.username ?? "");
  const [kinds, setKinds] = useState<LbPlaylistKind[]>(config.selectedKinds);

  const isDirty =
    enabled !== config.enabled ||
    username !== (config.username ?? "") ||
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
    });
  };

  const handleCancel = () => {
    setEnabled(config.enabled);
    setUsername(config.username ?? "");
    setKinds(config.selectedKinds);
  };

  return (
    <section className={subSection()}>
      <header className={subSectionHeader()}>
        <h3 className={subSectionTitle()}>
          <span className="inline-flex items-center gap-1.5">
            ListenBrainz
            <InfoTooltip description="Recommendations and curated playlists from your ListenBrainz account. Only the public username is needed." />
          </span>
        </h3>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Enable ListenBrainz" />
      </header>

      <div className={disabledOverlay({ disabled: !enabled })}>
        <SettingsField label="Username" helper="Your public ListenBrainz username (case-sensitive).">
          <SettingsTextInput value={username} onChange={setUsername} placeholder="e.g. yourname" />
        </SettingsField>

        <SettingsField label="Playlists to fetch" helper={`${kinds.length} selected. Each generates a separate feed.`}>
          <div className={playlistChipsGrid()}>
            {LB_PLAYLIST_KIND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={playlistChip({ selected: kinds.includes(opt.value) })}
                onClick={() => toggleKind(opt.value)}
                title={opt.description}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SettingsField>
      </div>

      <div className={subSectionSaveBar()}>
        <SaveBar isDirty={isDirty} isSaving={update.isPending} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </section>
  );
}
