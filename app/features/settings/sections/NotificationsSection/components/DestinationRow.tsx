"use client";

import { ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";
import {
  useRemoveNotificationDestination,
  useSaveNotificationDestination,
  useTestNotificationDestination,
} from "@hooks/api";

import { SaveBar } from "../../../components/SaveBar";
import { SaveLabelProvider } from "../../../components/SettingsSaveScope";
import { isDraftComplete, sameDraft, saveInputOf } from "../helpers";
import {
  actionsRow,
  channelHelp,
  channelPanel,
  destinationHeader,
  destinationName,
  destinationRow,
  toggleHelper,
  toggleLabel,
  toggleRow,
  toggleText,
} from "../styles";
import type { DestinationRowProps } from "../types";
import { ChannelFields } from "./ChannelFields";
import { ChannelMark } from "./ChannelMark";
import { DestinationStatus } from "./DestinationStatus";

export function DestinationRow({
  channel,
  destination,
  catalog,
  draft,
  baseline,
  open,
  onToggleOpen,
  onDraftChange,
  onSettled,
}: DestinationRowProps) {
  const { t } = useTranslation("settings");
  const save = useSaveNotificationDestination();
  const remove = useRemoveNotificationDestination();
  const test = useTestNotificationDestination();

  const dirty = !sameDraft(draft, baseline);
  const configured = destination?.configured ?? false;
  const channelName = t(`notifications.channels.${channel}`);
  const enableLabel = t("notifications.enable.label", { channel: channelName });

  const onSave = async () => {
    await save.mutateAsync(saveInputOf(channel, draft));
    onSettled();
    toast.success(t("notifications.saved", { channel: channelName }));
  };

  const onRemove = () => remove.mutate({ channel }, { onSuccess: onSettled });

  const onTest = () =>
    test.mutate(
      { channel },
      {
        onSuccess: (outcome) => {
          if (outcome.ok) {
            toast.success(t("notifications.test.sent", { channel: channelName }));
            return;
          }
          toast.error(t("notifications.test.failed", { reason: t(`notifications.failures.${outcome.failure}`) }));
        },
      }
    );

  return (
    <div className={destinationRow()} data-anchor-target={channel}>
      <div className={destinationHeader()}>
        <ChannelMark channel={channel} size="md" />
        <div className="min-w-0 flex-1">
          <p className={destinationName()}>{channelName}</p>
          <DestinationStatus destination={destination} />
        </div>
        {configured ? (
          <Switch
            checked={draft.enabled}
            onCheckedChange={(enabled) => onDraftChange({ ...draft, enabled })}
            aria-label={enableLabel}
          />
        ) : null}
        <Button size="sm" variant={configured ? "ghost" : "outline"} onClick={onToggleOpen} aria-expanded={open}>
          {configured
            ? open
              ? t("notifications.actions.close")
              : t("notifications.actions.edit")
            : t("notifications.actions.setUp")}
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </div>

      {open ? (
        <div className={channelPanel()}>
          <p className={channelHelp()}>{t(`notifications.channelHelp.${channel}`)}</p>

          <ChannelFields
            channel={channel}
            config={draft.config}
            ntfyServers={catalog.ntfyServers}
            onChange={(name, value) => onDraftChange({ ...draft, config: { ...draft.config, [name]: value } })}
          />

          {catalog.canFollowAllRequests ? (
            <div className={toggleRow()}>
              <div className={toggleText()}>
                <span className={toggleLabel()}>{t("notifications.allRequests.label")}</span>
                <span className={toggleHelper()}>{t("notifications.allRequests.helper")}</span>
              </div>
              <Switch
                checked={draft.allRequests}
                onCheckedChange={(allRequests) => onDraftChange({ ...draft, allRequests })}
                aria-label={t("notifications.allRequests.label")}
              />
            </div>
          ) : null}

          {configured ? (
            <div className={actionsRow()}>
              <Button variant="outline" size="sm" onClick={onTest} disabled={dirty || test.isPending}>
                <Send className="size-4" />
                {test.isPending ? t("notifications.actions.testing") : t("notifications.actions.test")}
              </Button>
              <Button variant="ghost" size="sm" onClick={onRemove} disabled={remove.isPending}>
                <Trash2 className="size-4" />
                {t("notifications.actions.remove")}
              </Button>
              {dirty ? <span className={toggleHelper()}>{t("notifications.actions.saveBeforeTest")}</span> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <SaveLabelProvider label={channelName}>
        <SaveBar
          isDirty={dirty}
          isSaving={save.isPending}
          saveDisabled={!isDraftComplete(channel, draft)}
          onSave={onSave}
          onCancel={onSettled}
        />
      </SaveLabelProvider>
    </div>
  );
}
