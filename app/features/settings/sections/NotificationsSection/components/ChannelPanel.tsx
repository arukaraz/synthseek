"use client";

import { Send, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { draftOf, isDraftComplete, sameDraft, saveInputOf } from "../helpers";
import { actionsRow, channelHelp, channelPanel, toggleHelper, toggleLabel, toggleRow, toggleText } from "../styles";
import type { ChannelPanelProps } from "../types";
import { ChannelFields } from "./ChannelFields";
import { DestinationStatus } from "./DestinationStatus";
import { KindChecklist } from "./KindChecklist";

export function ChannelPanel({ channel, destination, catalog }: ChannelPanelProps) {
  const { t } = useTranslation("settings");
  const baseline = draftOf(channel, destination);
  const [draft, setDraft] = useState(baseline);
  const save = useSaveNotificationDestination();
  const remove = useRemoveNotificationDestination();
  const test = useTestNotificationDestination();

  const dirty = !sameDraft(draft, baseline);
  const configured = destination?.configured ?? false;
  const channelName = t(`notifications.channels.${channel}`);

  const onSave = () =>
    save.mutate(saveInputOf(channel, draft), {
      onSuccess: (destinations) => {
        setDraft(
          draftOf(
            channel,
            destinations.find((entry) => entry.channel === channel)
          )
        );
        toast.success(t("notifications.saved", { channel: channelName }));
      },
    });

  const onRemove = () => remove.mutate({ channel }, { onSuccess: () => setDraft(draftOf(channel, undefined)) });

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
    <div className={channelPanel()}>
      <p className={channelHelp()}>{t(`notifications.channelHelp.${channel}`)}</p>

      <ChannelFields
        channel={channel}
        config={draft.config}
        ntfyServers={catalog.ntfyServers}
        onChange={(name, value) => setDraft({ ...draft, config: { ...draft.config, [name]: value } })}
      />

      <div className={toggleRow()}>
        <div className={toggleText()}>
          <span className={toggleLabel()}>{t("notifications.enable.label", { channel: channelName })}</span>
          <DestinationStatus destination={destination} />
        </div>
        <Switch
          checked={draft.enabled}
          onCheckedChange={(enabled) => setDraft({ ...draft, enabled })}
          aria-label={t("notifications.enable.label", { channel: channelName })}
        />
      </div>

      {catalog.canFollowAllRequests ? (
        <div className={toggleRow()}>
          <div className={toggleText()}>
            <span className={toggleLabel()}>{t("notifications.allRequests.label")}</span>
            <span className={toggleHelper()}>{t("notifications.allRequests.helper")}</span>
          </div>
          <Switch
            checked={draft.allRequests}
            onCheckedChange={(allRequests) => setDraft({ ...draft, allRequests })}
            aria-label={t("notifications.allRequests.label")}
          />
        </div>
      ) : null}

      <KindChecklist
        categories={catalog.categories}
        selected={draft.kinds}
        disabled={save.isPending}
        onChange={(kinds) => setDraft({ ...draft, kinds })}
      />

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

      <SaveBar
        isDirty={dirty}
        isSaving={save.isPending}
        saveDisabled={!isDraftComplete(channel, draft)}
        onSave={onSave}
        onCancel={() => setDraft(baseline)}
      />
    </div>
  );
}
