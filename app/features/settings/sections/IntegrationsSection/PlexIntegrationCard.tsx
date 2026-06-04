"use client";

import { Plug, Unplug } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";
import { usePlexConnect } from "@hooks/api/mutations/settings/usePlexConnect";
import { useUpdateConnectionsPlex } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useUpdateEnginePlexBehavior } from "@hooks/api/mutations/settings/useUpdateEngine";
import { useUpdateFormatting } from "@hooks/api/mutations/settings/useUpdateFormatting";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";

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
  serverPickerLocationBadge,
  serverPickerName,
  serverPickerUri,
  settingsCard,
  statusBadge,
  statusDot,
} from "../../styles";

import { AFFIX_VALUES } from "./constants";
import { previewName } from "./helpers";
import type { Affix, PlexIntegrationCardProps } from "./types";

export function PlexIntegrationCard({ initial }: PlexIntegrationCardProps) {
  const { t } = useTranslation("settings");
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
  const sampleUsername = currentUser?.username ?? t("plex.sampleUsernameFallback");

  const affixOptions: ReadonlyArray<{ value: Affix; label: string }> = AFFIX_VALUES.map((value) => ({
    value,
    label: t(`plex.affix.${value}`),
  }));

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
      toast.success(t("plex.disconnected"));
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
        <span className={cn(statusBadge({ tone: connected ? "success" : "muted" }))}>
          <span className={statusDot({ tone: connected ? "success" : "muted" })} />
          {connected ? t("plex.statusConnected") : t("plex.statusNotConnected")}
        </span>
      </div>

      <SettingsField
        label={t("plex.serverUrl.label")}
        helper={connected ? t("plex.serverUrl.helperConnected") : t("plex.serverUrl.helperDisconnected")}
      >
        <SettingsTextInput value={initial.connection.url} onChange={() => undefined} disabled />
      </SettingsField>

      {showServerPicker && plexConnect.state.kind === "picking" ? (
        <div className={serverPickerCard()}>
          <span className="text-fg/70 text-xs">{t("plex.serverPicker.prompt")}</span>
          <div className="flex flex-col gap-1.5">
            {plexConnect.state.servers.length === 0 ? (
              <span className="text-fg/50 text-xs">{t("plex.serverPicker.empty")}</span>
            ) : (
              plexConnect.state.servers.map((server) => (
                <button
                  key={`${server.clientIdentifier}-${server.uri}`}
                  type="button"
                  onClick={() => handlePickServer(server.uri)}
                  className={serverPickerButton()}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={serverPickerName()}>{server.name}</span>
                      <span className={serverPickerLocationBadge({ local: server.local })}>
                        {server.local ? t("plex.serverPicker.badgeLocal") : t("plex.serverPicker.badgeRemote")}
                      </span>
                    </div>
                    <span className={serverPickerUri()}>{server.uri}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleReconnect} disabled={plexConnect.state.kind === "pending"}>
          <Plug className="size-4" />
          {plexConnect.state.kind === "pending" ? t("plex.reconnectWaiting") : t("plex.reconnect")}
        </Button>
        {connected ? (
          <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={updatePlex.isPending}>
            <Unplug className="size-4" />
            {t("plex.disconnect")}
          </Button>
        ) : null}
      </div>

      <div className={cardDivider()} />

      <span className={cardSectionHeader()}>{t("plex.libraryHeader")}</span>
      <EngineRow
        label={t("plex.libraryScan.label")}
        description={t("plex.libraryScan.description")}
        control={
          <Switch
            checked={behaviorForm.draft.libraryScan}
            onCheckedChange={(v) => behaviorForm.setField("libraryScan", v)}
            aria-label={t("plex.libraryScan.label")}
          />
        }
      />
      <EngineRow
        label={t("plex.playlistSync.label")}
        description={t("plex.playlistSync.description")}
        control={
          <Switch
            checked={behaviorForm.draft.playlistSync}
            onCheckedChange={(v) => behaviorForm.setField("playlistSync", v)}
            aria-label={t("plex.playlistSync.label")}
          />
        }
      />

      <div className={cardDivider()} />

      <span className={cardSectionHeader()}>{t("plex.namingHeader")}</span>
      <EngineRow
        label={t("plex.usernameAffix.label")}
        description={t("plex.usernameAffix.description")}
        control={
          <SegmentedControl<Affix>
            value={namingForm.draft.plexPlaylistUsernameAffix}
            options={affixOptions}
            onChange={(v) => namingForm.setField("plexPlaylistUsernameAffix", v)}
            ariaLabel={t("plex.usernameAffix.label")}
          />
        }
      />
      <SettingsField label={t("plex.separator.label")} helper={t("plex.separator.helper")}>
        <SettingsTextInput
          value={namingForm.draft.plexPlaylistUsernameSeparator}
          onChange={(v) => namingForm.setField("plexPlaylistUsernameSeparator", v)}
          placeholder={t("plex.separator.placeholder")}
          disabled={namingForm.draft.plexPlaylistUsernameAffix === "off"}
        />
      </SettingsField>
      <div className="flex flex-col gap-1">
        <span className="text-fg/45 text-[11px] font-semibold tracking-wider uppercase">{t("plex.previewHeader")}</span>
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
