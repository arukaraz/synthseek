"use client";

import { useAuthContext } from "@modules/providers/AuthProvider";
import { useUpdateFormatting } from "@hooks/api/mutations/settings/useUpdateFormatting";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { formattingPreview } from "../../styles";

type Affix = "off" | "prefix" | "suffix";

const AFFIX_OPTIONS: ReadonlyArray<{ value: Affix; label: string }> = [
  { value: "off", label: "Off" },
  { value: "prefix", label: "Prefix" },
  { value: "suffix", label: "Suffix" },
];

interface PlexPlaylistFormatCardProps {
  initial: {
    plexPlaylistUsernameAffix: Affix;
    plexPlaylistUsernameSeparator: string;
  };
}

function previewName(affix: Affix, separator: string, username: string): string {
  const base = "Discover Weekly";
  if (affix === "off" || !username) return base;
  if (affix === "prefix") return `${username}${separator}${base}`;
  return `${base}${separator}${username}`;
}

export function PlexPlaylistFormatCard({ initial }: PlexPlaylistFormatCardProps) {
  const { currentUser } = useAuthContext();
  const update = useUpdateFormatting();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  const sampleUsername = currentUser?.username ?? "alice";

  return (
    <SettingsCard
      title="Plex playlist names"
      description="Prefix or suffix Plex playlist names with the requester's username so multi-user playlists do not collide."
    >
      <EngineRow
        label="Username affix"
        description="Where to attach the username relative to the playlist name."
        control={
          <SegmentedControl<Affix>
            value={draft.plexPlaylistUsernameAffix}
            options={AFFIX_OPTIONS}
            onChange={(v) => setField("plexPlaylistUsernameAffix", v)}
            ariaLabel="Username affix"
          />
        }
      />

      <SettingsField label="Separator" helper="Character(s) between the name and username. Common: _, -, ·">
        <SettingsTextInput
          value={draft.plexPlaylistUsernameSeparator}
          onChange={(v) => setField("plexPlaylistUsernameSeparator", v)}
          placeholder="_"
          disabled={draft.plexPlaylistUsernameAffix === "off"}
        />
      </SettingsField>

      <div className="flex flex-col gap-1">
        <span className="text-fg/45 text-[11px] font-semibold tracking-wider uppercase">Preview</span>
        <span className={formattingPreview()}>
          {previewName(draft.plexPlaylistUsernameAffix, draft.plexPlaylistUsernameSeparator, sampleUsername)}
        </span>
      </div>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
