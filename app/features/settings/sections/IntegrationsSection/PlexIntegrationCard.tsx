"use client";

import { Plug, Unplug } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";
import { cn } from "@utils/cn";
import { useUpdateConnectionsPlex } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useUpdateEnginePlexBehavior } from "@hooks/api/mutations/settings/useUpdateEngine";
import { usePlexConnect } from "@hooks/api/mutations/settings/usePlexConnect";
import { useUpdateFormatting } from "@hooks/api/mutations/settings/useUpdateFormatting";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import {
  cardDivider,
  cardSectionHeader,
  formattingPreview,
  serverPickerButton,
  serverPickerCard,
  settingsCard,
  statusBadge,
  statusDot,
} from "../../styles";

type Affix = "off" | "prefix" | "suffix";

const AFFIX_OPTIONS: ReadonlyArray<{ value: Affix; label: string }> = [
  { value: "off", label: "Off" },
  { value: "prefix", label: "Prefix" },
  { value: "suffix", label: "Suffix" },
];

interface PlexIntegrationCardProps {
  initial: {
    connection: { url: string; token: string };
    behavior: { libraryScan: boolean; playlistSync: boolean };
    naming: { plexPlaylistUsernameAffix: Affix; plexPlaylistUsernameSeparator: string };
  };
}

function previewName(affix: Affix, separator: string, username: string): string {
  const base = "Discover Weekly";
  if (affix === "off" || !username) return base;
  if (affix === "prefix") return `${username}${separator}${base}`;
  return `${base}${separator}${username}`;
}

export function PlexIntegrationCard({ initial }: PlexIntegrationCardProps) {
  const { currentUser } = useAuthContext();
  const updatePlex = useUpdateConnectionsPlex();
  const updateBehavior = useUpdateEnginePlexBehavior();
  const updateFormatting = useUpdateFormatting();
  const plexConnect = usePlexConnect();
  const [showServerPicker, setShowServerPicker] = useState(false);

  const behaviorForm = useSettingsForm(initial.behavior);
  const namingForm = useSettingsForm(initial.naming);

  if (!behaviorForm.draft || !namingForm.draft) return null;

  const connected = Boolean(initial.connection.url && initial.connection.token);
  const sampleUsername = currentUser?.username ?? "alice";

  const isDirty = behaviorForm.isDirty || namingForm.isDirty;
  const isSaving = behaviorForm.isSaving || namingForm.isSaving;

  const handleReconnect = async () => {
    setShowServerPicker(true);
    await plexConnect.start();
  };

  const handlePickServer = async (uri: string) => {
    await plexConnect.saveServer(uri);
    setShowServerPicker(false);
  };

  const handleDisconnect = async () => {
    try {
      await updatePlex.mutateAsync({ url: "", token: "" });
      toast.success("Plex disconnected");
    } catch (error) {
      void error;
    }
  };

  const handleSave = async () => {
    const promises: Promise<unknown>[] = [];
    if (behaviorForm.isDirty) promises.push(behaviorForm.save((payload) => updateBehavior.mutateAsync(payload)));
    if (namingForm.isDirty) promises.push(namingForm.save((payload) => updateFormatting.mutateAsync(payload)));
    await Promise.all(promises);
  };

  const handleReset = () => {
    behaviorForm.reset();
    namingForm.reset();
  };

  return (
    <section className={settingsCard()}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-fg/60 text-sm">Library scans, playlist sync, and playlist naming for this Plex install.</p>
        <span className={cn(statusBadge({ tone: connected ? "success" : "muted" }))}>
          <span className={statusDot({ tone: connected ? "success" : "muted" })} />
          {connected ? "Connected" : "Not connected"}
        </span>
      </div>

      <SettingsField
        label="Server URL"
        helper={connected ? "Detected via OAuth. Edit by reconnecting." : "Click Reconnect to link a Plex server."}
      >
        <SettingsTextInput value={initial.connection.url} onChange={() => undefined} disabled />
      </SettingsField>

      {showServerPicker && plexConnect.state.kind === "picking" ? (
        <div className={serverPickerCard()}>
          <span className="text-fg/70 text-xs">Pick the Plex server Synthseek should target:</span>
          <div className="flex flex-col gap-1.5">
            {plexConnect.state.servers.length === 0 ? (
              <span className="text-fg/50 text-xs">No servers found on this Plex account.</span>
            ) : (
              plexConnect.state.servers.map((server) => (
                <button
                  key={`${server.clientIdentifier}-${server.uri}`}
                  type="button"
                  onClick={() => handlePickServer(server.uri)}
                  className={serverPickerButton()}
                >
                  <span className="text-fg text-sm">{server.name}</span>
                  <span className="text-fg/40 text-xs">
                    {server.local ? "local" : "remote"} · {server.uri}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleReconnect} disabled={plexConnect.state.kind === "pending"}>
          <Plug className="size-4" />
          {plexConnect.state.kind === "pending" ? "Waiting for Plex..." : "Reconnect"}
        </Button>
        {connected ? (
          <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={updatePlex.isPending}>
            <Unplug className="size-4" />
            Disconnect
          </Button>
        ) : null}
      </div>

      <div className={cardDivider()} />

      <span className={cardSectionHeader()}>Library</span>
      <EngineRow
        label="Library scan"
        description="Trigger a Plex library scan after each successful import."
        control={
          <Switch
            checked={behaviorForm.draft.libraryScan}
            onCheckedChange={(v) => behaviorForm.setField("libraryScan", v)}
            aria-label="Library scan"
          />
        }
      />
      <EngineRow
        label="Playlist sync"
        description="Mirror Synthseek playlist requests into Plex collections."
        control={
          <Switch
            checked={behaviorForm.draft.playlistSync}
            onCheckedChange={(v) => behaviorForm.setField("playlistSync", v)}
            aria-label="Playlist sync"
          />
        }
      />

      <div className={cardDivider()} />

      <span className={cardSectionHeader()}>Playlist naming</span>
      <EngineRow
        label="Username affix"
        description="Prefix or suffix Plex playlist names with the requester's username so multi-user playlists do not collide."
        control={
          <SegmentedControl<Affix>
            value={namingForm.draft.plexPlaylistUsernameAffix}
            options={AFFIX_OPTIONS}
            onChange={(v) => namingForm.setField("plexPlaylistUsernameAffix", v)}
            ariaLabel="Username affix"
          />
        }
      />
      <SettingsField label="Separator" helper="Character(s) between the name and username. Common: _, -, ·">
        <SettingsTextInput
          value={namingForm.draft.plexPlaylistUsernameSeparator}
          onChange={(v) => namingForm.setField("plexPlaylistUsernameSeparator", v)}
          placeholder="_"
          disabled={namingForm.draft.plexPlaylistUsernameAffix === "off"}
        />
      </SettingsField>
      <div className="flex flex-col gap-1">
        <span className="text-fg/45 text-[11px] font-semibold tracking-wider uppercase">Preview</span>
        <span className={formattingPreview()}>
          {previewName(
            namingForm.draft.plexPlaylistUsernameAffix,
            namingForm.draft.plexPlaylistUsernameSeparator,
            sampleUsername
          )}
        </span>
      </div>

      <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={handleReset} />
    </section>
  );
}
